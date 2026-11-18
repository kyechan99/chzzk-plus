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
  it('does not let an old 404 consume the new visit retry budget', async () => {
    vi.useFakeTimers();
    let old!: (value: unknown) => void;
    let current!: (value: unknown) => void;
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => { old = resolve; }))
      .mockImplementationOnce(() => new Promise(resolve => { current = resolve; }))
      .mockResolvedValue({ ok: true, json: async () => ({ content: { videoNo: 88003, channel: { channelId: a } } }) });
    vi.stubGlobal('fetch', fetchMock);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">channel</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    history.replaceState({}, '', '/video/88003');
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', '/');
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', '/video/88003');
    await act(async () => ensureFavoriteButton(true));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => old({ ok: false, status: 404 }));
    await act(async () => current({ ok: false, status: 503 }));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });
  it('retries when a response body never finishes', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: () => new Promise(() => {}) })
      .mockResolvedValue({ ok: true, json: async () => ({ content: { videoNo: 88001, channel: { channelId: a } } }) });
    vi.stubGlobal('fetch', fetchMock);
    history.replaceState({}, '', '/video/88001');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">channel</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(32000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });
  it('allows a new request after returning while an old visit is pending', async () => {
    let resolveOld!: (value: unknown) => void;
    const fetchMock = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
      .mockResolvedValue({ ok: true, json: async () => ({ content: { videoNo: 88002, channel: { channelId: a } } }) });
    vi.stubGlobal('fetch', fetchMock);
    history.replaceState({}, '', '/video/88002');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">channel</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', '/');
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', '/video/88002');
    await act(async () => ensureFavoriteButton(true));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => resolveOld({ ok: false, status: 404 }));
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });
  it('restores the parent inline layout on removal', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">channel</a><div class="_control_example"><div style="display:grid;gap:13px"><button>팔로잉</button></div></div></div></div></div>`;
    const parent = document.querySelector('button')!.parentElement!;
    await act(async () => ensureFavoriteButton(true));
    await act(async () => removeFavoriteButton());
    expect(parent.style.display).toBe('grid');
    expect(parent.style.gap).toBe('13px');
  });
  it('skips malformed header links before the matching channel link', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="https://[">bad</a><a href="/live/${a}">channel</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).not.toBeNull();
  });
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
    let resolve!: (value: unknown) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise(r => { resolve = r; })));
    history.replaceState({}, '', '/video/16231172');
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${b}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).toBeNull();
    await act(async () => resolve({ ok: true, json: async () => ({ content: { videoNo: 16231172, channel: { channelId: a } } }) }));
    expect(document.querySelector('.favorite-btn')).toBeNull();
    document.querySelector('a')!.setAttribute('href', `/live/${a}`);
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')?.getAttribute('data-channel-id')).toBe(a);
  });

  it('rejects matching following controls in navigation', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><nav><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><button>팔로잉</button></div></div></div></nav></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('.favorite-btn')).toBeNull();
  });
  it('rejects a valid header for another channel', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${b}">채널</a><div class="_control_example"><button>팔로잉</button></div></div></div></div>`;
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

  it('mounts on a channel home header with a matching profile link', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><div class="_wrapper_home"><div class="_area_home"><div class="_information_home"><a href="https://game.naver.com/profile/${a}">프로필 보기</a></div><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
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
  it('refuses a menu action on a replaced follow button before reconciliation', async () => {
    const group = { id: 'group', name: '그룹', icon: 'star', color: '#ff0000', channelIds: [] };
    const storage = chrome.storage.local as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
    storage.get.mockImplementation((_keys, cb) => cb({ [FAVORITE_GROUPS]: JSON.stringify({ groups: [group] }) }));
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    await act(async () => (document.querySelector('.favorite-btn') as HTMLElement).click());
    const old = Array.from(document.querySelectorAll('button')).find(x => x.textContent === '팔로잉')!;
    old.replaceWith(old.cloneNode(true));
    await act(async () => (document.querySelector('.czp-fav-group-item') as HTMLElement).click());
    expect(storage.set).not.toHaveBeenCalled();
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
  it('mounts on an offline channel home with only a Naver profile link', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><div class="_wrapper_home"><div class="_area_home"><div class="_information_home"><a href="https://game.naver.com/profile/${a}">프로필</a></div><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')?.getAttribute('data-channel-id')).toBe(a);
  });

  it('rejects a profile link from a different host or a different channel', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><div class="_wrapper_home"><div class="_area_home"><div class="_information_home"><a href="https://game.naver.com.evil.example/profile/${a}">가짜</a><a href="https://game.naver.com/profile/${b}">다른 채널</a></div><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')).toBeNull();
  });
  it('rejects a channel home when only the live link matches but its profile identifies another channel', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><a href="/live/${a}">라이브</a><div class="_wrapper_home"><div class="_area_home"><div class="_information_home"><a href="https://game.naver.com/profile/${b}">프로필 보기</a></div><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')).toBeNull();
  });
  it('ignores a matching profile outside the home identity area', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><aside><a href="https://game.naver.com/profile/${a}">추천</a></aside><div class="_wrapper_home"><div class="_area_home"><div class="_information_home"><a href="https://game.naver.com/profile/${b}">프로필 보기</a></div><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')).toBeNull();
  });
  it('ignores unrelated profiles nested in the home area outside channel information', async () => {
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_container_home"><div class="_wrapper_home"><div class="_area_home"><div class="_information_home"><a href="https://game.naver.com/profile/${b}">프로필</a></div><aside><a href="https://game.naver.com/profile/${a}">추천</a></aside><div class="_control_home"><div class="_action_home"><div class="_follow_home"><button>팔로잉</button></div></div></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    expect(document.querySelector('#chzzk-plus-favorite-btn')).toBeNull();
  });
  it('allows a same-channel action after only the query changes without a route event', async () => {
    const group = { id: 'query-group', name: '그룹', icon: 'star', color: '#ff0000', channelIds: [] };
    const storage = chrome.storage.local as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
    storage.get.mockImplementation((_keys, cb) => cb({ [FAVORITE_GROUPS]: JSON.stringify({ groups: [group] }) }));
    history.replaceState({}, '', `/${a}`);
    document.body.innerHTML = `<div id="layout-body"><div class="_row_example"><div class="_inner_example"><a href="/live/${a}">채널</a><div class="_control_example"><div><button>팔로잉</button></div></div></div></div></div>`;
    await act(async () => ensureFavoriteButton(true));
    history.replaceState({}, '', `/${a}?view=changed`);
    await act(async () => (document.querySelector('.favorite-btn') as HTMLElement).click());
    await act(async () => (document.querySelector('.czp-fav-group-item') as HTMLElement).click());
    expect(storage.set).toHaveBeenCalledTimes(1);
  });
});
