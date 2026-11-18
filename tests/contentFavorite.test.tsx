import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { FAVORITE_ENABLE } from '../src/constants/storage';

const { ensure, remove } = vi.hoisted(() => ({ ensure: vi.fn(), remove: vi.fn() }));
vi.mock('../src/utils/favoriteButton', () => ({ ensureFavoriteButton: ensure, removeFavoriteButton: remove }));
vi.mock('../src/page/live', () => ({ editLivePage: vi.fn() }));
vi.mock('../src/page/video', () => ({ editVideoPage: vi.fn() }));
vi.mock('../src/page/global', () => ({ editGlobalPage: vi.fn() }));
vi.mock('../src/page/lives', () => ({ editLiveListPage: vi.fn() }));
vi.mock('../src/page/category', () => ({ editCategoryPage: vi.fn() }));
vi.mock('../src/utils/dom', () => ({ waitingElement: vi.fn(() => new Promise(() => {})) }));
vi.mock('../src/feature/videoFilter', () => ({ initVideoFilter: vi.fn() }));
vi.mock('../src/feature/liveNewTab', () => ({ initLiveNewTab: vi.fn() }));
vi.mock('../src/feature/followNotify', () => ({ initFollowNotify: vi.fn() }));
vi.mock('../src/feature/tabViewerCount', () => ({ initTabViewerCount: vi.fn() }));
vi.mock('../src/feature/powerCollect', () => ({ initPowerCollect: vi.fn() }));
vi.mock('../src/feature/layoutCustom', () => ({ initLayoutCustom: vi.fn() }));
vi.mock('../src/feature/chatTimestamp', () => ({ initChatTimestamp: vi.fn() }));
vi.mock('../src/feature/chatEmojiSearch', () => ({ initChatEmojiSearch: vi.fn() }));
vi.mock('../src/feature/cheezeRankingRemover', () => ({ initCheezeRankingRemover: vi.fn() }));
vi.mock('../src/feature/chatBadgeRemover', () => ({ initChatBadgeRemover: vi.fn() }));
vi.mock('../src/feature/chatColor', () => ({ initChatColor: vi.fn() }));

describe('content favorite reconciliation', () => {
  const OriginalObserver = MutationObserver;
  const originalPush = history.pushState;
  const originalReplace = history.replaceState;
  let observers: MutationObserver[];
  let listeners: Array<[string, EventListenerOrEventListenerObject]>;

  beforeEach(() => {
    observers = [];
    listeners = [];
    vi.stubGlobal('MutationObserver', class extends OriginalObserver {
      constructor(callback: MutationCallback) {
        super(callback);
        observers.push(this);
      }
    });
    const addEventListener = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
      if (listener) listeners.push([type, listener]);
      addEventListener(type, listener, options);
    });
    vi.useFakeTimers();
    vi.resetModules();
    ensure.mockReset(); remove.mockReset();
    history.replaceState({}, '', '/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });
  afterEach(() => {
    observers.forEach(observer => observer.disconnect());
    listeners.forEach(([type, listener]) => window.removeEventListener(type, listener));
    history.pushState = originalPush;
    history.replaceState = originalReplace;
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('notices changes only to the follow tooltip', async () => {
    vi.stubGlobal('chrome', { runtime: { getURL: () => 'inject.js' }, storage: { local: { get: (_: unknown, cb: (v: unknown) => void) => cb({ [FAVORITE_ENABLE]: true }) }, onChanged: { addListener: vi.fn() } } });
    document.body.innerHTML = '<button data-tooltip="팔로우"></button>';
    await import('../src/content');
    ensure.mockClear();
    const button = document.querySelector('button')!;
    button.setAttribute('data-tooltip', '팔로잉');
    await Promise.resolve(); await vi.advanceTimersByTimeAsync(300);
    expect(ensure).toHaveBeenCalledWith(true);
    ensure.mockClear();
    button.setAttribute('data-tooltip', '팔로우');
    await Promise.resolve(); await vi.advanceTimersByTimeAsync(300);
    expect(ensure).toHaveBeenCalledWith(true);
  });

  it('does not starve a delayed setting read under repeated DOM updates', async () => {
    vi.stubGlobal('chrome', { runtime: { getURL: () => 'inject.js' }, storage: { local: { get: (_: unknown, cb: (v: unknown) => void) => setTimeout(() => cb({ [FAVORITE_ENABLE]: true }), 300) }, onChanged: { addListener: vi.fn() } } });
    document.body.innerHTML = '<div></div>';
    await import('../src/content');
    for (let i = 0; i < 5; i++) {
      document.querySelector('div')!.textContent = String(i);
      await Promise.resolve(); await vi.advanceTimersByTimeAsync(250);
    }
    expect(ensure).toHaveBeenCalledWith(true);
  });

  it('handles a page-world navigation occurring during injection', async () => {
    vi.stubGlobal('chrome', { runtime: { getURL: () => 'inject.js' }, storage: { local: { get: (_: unknown, cb: (v: unknown) => void) => cb({ [FAVORITE_ENABLE]: true }) }, onChanged: { addListener: vi.fn() } } });
    const append = document.head.appendChild.bind(document.head);
    const spy = vi.spyOn(document.head, 'appendChild').mockImplementation(node => {
      history.replaceState({}, '', '/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
      window.dispatchEvent(new Event('czp-route-change'));
      return append(node);
    });
    await import('../src/content');
    expect(remove).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('handles a page-world route notification for a query-only navigation', async () => {
    vi.stubGlobal('chrome', { runtime: { getURL: () => 'inject.js' }, storage: { local: { get: (_: unknown, cb: (v: unknown) => void) => cb({ [FAVORITE_ENABLE]: true }) }, onChanged: { addListener: vi.fn() } } });
    const source = readFileSync('public/inject.js', 'utf8');
    window.eval(source);
    const pageReplace = history.replaceState.bind(history);
    const pagePush = history.pushState.bind(history);
    await import('../src/content');
    remove.mockClear();
    ensure.mockClear();
    pageReplace({}, '', `${location.pathname}?view=one`);
    expect(remove).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    expect(ensure).toHaveBeenCalledWith(true);
    remove.mockClear();
    pagePush({}, '', `${location.pathname}?view=two`);
    expect(remove).toHaveBeenCalled();
  });
});
