import { act } from 'react-dom/test-utils';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { FAVORITE_GROUPS } from '../src/constants/storage';
import { ensureFavoriteButton, removeFavoriteButton } from '../src/utils/favoriteButton';

const a = 'a'.repeat(32);
const b = 'b'.repeat(32);

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => ({
        content: { videoNo: Number(url.split('/').pop()), channel: { channelId: url.endsWith('16231171') ? b : a } },
      }),
    })),
  );
  vi.stubGlobal('chrome', {
    runtime: {},
    storage: {
      local: {
        get: vi.fn((_keys, cb) => cb({})),
        set: vi.fn((_value, cb) => cb()),
      },
      onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
    },
  });
});

afterEach(async () => {
  await act(async () => removeFavoriteButton());
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('favorite button on channel pages', () => {
  it('mounts next to the followed channel without a main element', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });

  it('resolves the VOD channel from the nearby channel link', async () => {
    history.replaceState({}, '', '/video/16231170');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')?.getAttribute('data-channel-id')).toBe(a);
  });

  it('updates the channel when the SPA reuses the same controls', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', `/${b}`);
    document.querySelector('a')!.setAttribute('href', `/live/${b}`);
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')?.getAttribute('data-channel-id')).toBe(b);
  });
  it('ignores following text inside the extension own button on reconciliation', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    const favorite = document.querySelector('.favorite-btn')!;
    favorite.textContent = '팔로잉';
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelectorAll('#chzzk-plus-favorite-btn')).toHaveLength(1);
    expect(
      document.querySelector('#chzzk-plus-favorite-btn')?.parentElement?.querySelector('button:not(.favorite-btn)'),
    ).not.toBeNull();
  });

  it('ignores a late metadata response after navigating to another video', async () => {
    let resolveOld!: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.endsWith('/101')
          ? new Promise(resolve => {
              resolveOld = resolve;
            })
          : Promise.resolve({ ok: true, json: async () => ({ content: { videoNo: 102, channel: { channelId: b } } }) }),
      ),
    );
    history.replaceState({}, '', '/video/101');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', '/video/102');
    document.querySelector('a')!.setAttribute('href', `/live/${b}`);
    await act(async () => ensureFavoriteButton(true));
    await act(async () =>
      resolveOld({ ok: true, json: async () => ({ content: { videoNo: 101, channel: { channelId: a } } }) }),
    );
    expect(document.querySelector('#chzzk-plus-favorite-btn')?.getAttribute('data-channel-id')).toBe(b);
  });

  it('accepts matching visible and accessible follow labels', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button aria-label="팔로잉">팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });

  it('waits for the matching header after metadata resolves', async () => {
    history.replaceState({}, '', '/video/16231170');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${b}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).toBeNull();
    document.querySelector('a')!.setAttribute('href', `/live/${a}`);
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')?.getAttribute('data-channel-id')).toBe(a);
  });

  it('rejects unrelated following controls and stale channel links', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><nav><div class="_row_example"><a href="/live/${a}">채널</a><button>팔로잉</button></div></nav><div class="_row_example"><a href="/live/${b}">채널</a><button>팔로잉</button></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).toBeNull();
  });

  it('persists the selected group but refuses an action from a stale header', async () => {
    const group = { id: 'group', name: '그룹', icon: 'star', color: '#ff0000', channelIds: [] };
    const storage = chrome.storage.local as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
    storage.get.mockImplementation((_keys, cb) => cb({ [FAVORITE_GROUPS]: JSON.stringify({ groups: [group] }) }));
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    await act(async () => (document.querySelector('.favorite-btn') as HTMLElement).click());
    await act(async () => (document.querySelector('.czp-fav-group-item') as HTMLElement).click());
    expect(storage.set).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(storage.set.mock.calls[0][0])).toContain(a);
    await act(async () => (document.querySelector('.favorite-btn') as HTMLElement).click());
    document.querySelector('a')!.setAttribute('href', `/live/${b}`);
    await act(async () => (document.querySelector('.czp-fav-action-danger') as HTMLElement).click());
    expect(storage.set).toHaveBeenCalledTimes(1);
  });

  it('does not allow edits before the initial storage read completes', async () => {
    const storage = chrome.storage.local as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
    storage.get.mockImplementation(() => {});
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect((document.querySelector('.favorite-btn') as HTMLButtonElement).disabled).toBe(true);
  });

  it('does not replace a newer storage change with the delayed initial read', async () => {
    let initial!: (value: unknown) => void;
    let listener!: (changes: unknown) => void;
    const storage = chrome.storage.local as unknown as { get: ReturnType<typeof vi.fn> };
    storage.get.mockImplementation((_keys, callback) => {
      initial = callback;
    });
    (chrome.storage.onChanged.addListener as ReturnType<typeof vi.fn>).mockImplementation(callback => {
      listener = callback;
    });
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    const current = { groups: [{ id: 'g', name: '새 그룹', icon: 'star', color: '#ff0000', channelIds: [a] }] };
    await act(async () => listener({ [FAVORITE_GROUPS]: { newValue: JSON.stringify(current) } }));
    await act(async () => initial({ [FAVORITE_GROUPS]: JSON.stringify({ groups: [] }) }));
    expect(document.querySelector('.favorite-btn')?.textContent).toContain('새 그룹');
  });

  it('retries a failed metadata request without requiring a DOM mutation', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ ok: true, json: async () => ({ content: { videoNo: 9001, channel: { channelId: a } } }) });
    vi.stubGlobal('fetch', fetchMock);
    history.replaceState({}, '', '/video/9001');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('mounts on a channel home header whose thumbnail links to that channel', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><a class="_thumbnail_home" href="/live/${a}">채널</a><div class="_wrapper_home"><div class="_area_home"><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });

  it('does not mount on a video whose header still belongs to the previous video', async () => {
    history.replaceState({}, '', '/video/16231171');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')).toBeNull();
  });
  it('remains usable after the native follow button is replaced', async () => {
    const group = { id: 'group', name: '그룹', icon: 'star', color: '#ff0000', channelIds: [] };
    const storage = chrome.storage.local as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
    storage.get.mockImplementation((_keys, cb) => cb({ [FAVORITE_GROUPS]: JSON.stringify({ groups: [group] }) }));
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    const old = Array.from(document.querySelectorAll('button')).find(x => x.textContent === '팔로잉')!;
    const replacement = old.cloneNode(true);
    old.replaceWith(replacement);
    await act(async () => ensureFavoriteButton(true));
    await act(async () => (document.querySelector('.favorite-btn') as HTMLElement).click());
    await act(async () => (document.querySelector('.czp-fav-group-item') as HTMLElement).click());
    expect(storage.set).toHaveBeenCalledTimes(1);
  });
  it('stops retrying permanent metadata failures', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', fetchMock);
    history.replaceState({}, '', '/video/79991');
    await act(async () => ensureFavoriteButton(true));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(12000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('retries after leaving and returning following transient failures', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    history.replaceState({}, '', '/video/79992');
    await act(async () => ensureFavoriteButton(true));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    history.replaceState({}, '', '/');
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', '/video/79992');
    await act(async () => ensureFavoriteButton(true));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
