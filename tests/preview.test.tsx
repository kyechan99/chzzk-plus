import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Preview from '../src/components/video/Preview/Preview';
import { getLiveDetail } from '../src/utils/stream';

vi.mock('../src/utils/stream', () => ({
  getLiveDetail: vi.fn(async () => ({ hlsUrl: null, title: '', thumbnail: '' })),
}));

const channelId = 'a'.repeat(32);
let root: Root | null;

function addSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar';
  sidebar.innerHTML = `<ul><li><a href="/live/${channelId}"><span>LIVE</span></a></li>
    <li><a href="/${'b'.repeat(32)}">Offline</a></li></ul>`;
  document.body.append(sidebar);
  return sidebar;
}

async function mouse(target: Element, type: string, relatedTarget: EventTarget | null = null) {
  await act(async () => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: type !== 'mouseleave', relatedTarget }));
  });
}

async function advanceHideTimer() {
  await act(async () => {
    vi.advanceTimersByTime(100);
  });
}

function preview() {
  return document.querySelector<HTMLDivElement>('.czp-preview')!;
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('chrome', { storage: { local: { get: vi.fn((_keys, callback) => callback({})), set: vi.fn() } } });
  addSidebar();
  const host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(<Preview />);
  });
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('sidebar preview', () => {
  it('opens on the replacement sidebar after layout changes, without remounting', async () => {
    const original = document.querySelector('#sidebar')!;
    await mouse(original.querySelector('span')!, 'mouseover');
    expect(preview().style.display).toBe('block');
    await mouse(original, 'mouseout', document.body);
    await mouse(original, 'mouseleave', document.body);
    await advanceHideTimer();
    expect(preview().style.display).toBe('none');

    for (let i = 0; i < 3; i++) {
      document.querySelector('#sidebar')!.remove();
      const replacement = addSidebar();
      await mouse(replacement.querySelector('span')!, 'mouseover');
      expect(preview().style.display).toBe('block');
      expect(getLiveDetail).toHaveBeenLastCalledWith(channelId);
      await mouse(replacement, 'mouseout', document.body);
      await mouse(replacement, 'mouseleave', document.body);
      await advanceHideTimer();
      expect(preview().style.display).toBe('none');
    }
    expect(getLiveDetail).toHaveBeenCalledTimes(4);
  });

  it('ignores channel links outside the sidebar and offline entries', async () => {
    const outside = document.createElement('a');
    outside.href = `/live/${channelId}`;
    document.body.append(outside);
    await mouse(outside, 'mouseover');
    await mouse(document.querySelector('#sidebar li:last-child a')!, 'mouseover');
    expect(preview().style.display).toBe('none');
    expect(getLiveDetail).not.toHaveBeenCalled();
  });

  it('keeps the preview open while moving between sidebar children', async () => {
    const span = document.querySelector('#sidebar span')!;
    await mouse(span, 'mouseover');
    await mouse(span, 'mouseout', span.parentElement);
    await advanceHideTimer();
    expect(preview().style.display).toBe('block');
  });

  it('allows entering the preview before the hide delay expires', async () => {
    const sidebar = document.querySelector('#sidebar')!;
    await mouse(sidebar.querySelector('span')!, 'mouseover');
    await mouse(sidebar, 'mouseout', preview());
    await mouse(sidebar, 'mouseleave', preview());
    await mouse(preview(), 'mouseover', sidebar);
    await advanceHideTimer();
    expect(preview().style.display).toBe('block');
    await mouse(preview(), 'mouseout', document.body);
    await advanceHideTimer();
    expect(preview().style.display).toBe('none');
  });

  it('keeps pinned previews visible when leaving the sidebar', async () => {
    const sidebar = document.querySelector('#sidebar')!;
    await mouse(sidebar.querySelector('span')!, 'mouseover');
    await act(async () => {
      document.querySelector<HTMLButtonElement>('.czp-preview-pin')!.click();
    });
    await mouse(sidebar, 'mouseout', document.body);
    await mouse(sidebar, 'mouseleave', document.body);
    await advanceHideTimer();
    expect(preview().style.display).toBe('block');
  });

  it('hides when the pointer leaves the browser from the sidebar', async () => {
    const sidebar = document.querySelector('#sidebar')!;
    await mouse(sidebar.querySelector('span')!, 'mouseover');
    await mouse(sidebar.querySelector('span')!, 'mouseout');
    await advanceHideTimer();
    expect(preview().style.display).toBe('none');
  });

  it('removes document listeners and pending hide timers on unmount', async () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const sidebar = document.querySelector('#sidebar')!;
    await mouse(sidebar.querySelector('span')!, 'mouseover');
    await mouse(sidebar, 'mouseout', document.body);
    expect(vi.getTimerCount()).toBe(1);
    await act(async () => {
      root!.unmount();
    });
    root = null;
    expect(vi.getTimerCount()).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('mouseover', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('mouseout', expect.any(Function));
    vi.mocked(getLiveDetail).mockClear();
    await mouse(sidebar.querySelector('span')!, 'mouseover');
    expect(getLiveDetail).not.toHaveBeenCalled();
  });
});
