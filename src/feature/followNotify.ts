/**
 * 팔로잉 채널 변경 알림.
 *
 * 좌측 팔로잉 사이드바에 보이는 채널 = 현재 라이브 채널로 보고, 채널 집합의 변화를 추적한다.
 *  - 새로 등장한 채널 → "OOO 방송 시작"
 *  - 사라진 채널     → "OOO 방송 종료"
 * 화면 우측 상단에 토스트로 2초간, 최대 3개까지 표시한다.
 *
 * 즐겨찾기 기능이 켜져 있고 해당 채널이 즐겨찾기 그룹에 속하면 "[그룹명] OOO 방송 시작" 으로.
 *
 * 자동 새로고침 등으로 목록이 통째로 재구성될 때의 깜빡임을 흡수하기 위해 디바운스 후 비교한다.
 * 첫 스냅샷은 기준선으로만 쓰고 토스트를 띄우지 않는다(진입 시 폭주 방지).
 */
import { SIDEBAR, SIDEBAR_MENU } from '../constants/class';
import { FAVORITE_ENABLE, FAVORITE_GROUPS, FOLLOW_NOTIFY_END, FOLLOW_NOTIFY_START } from '../constants/storage';
import { waitingElement } from '../utils/dom';
import { FavoriteData, findGroupOfChannel, parseFavoriteData, readFavoriteData } from '../utils/favoriteStore';

// 새로운 토스트 인터페이스 정의
interface ToastOptions {
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  variant?: 'primary' | 'neutral';
  duration?: number;
}

const CHANNEL_ID_REGEX = /[0-9a-f]{32}/;
const TOAST_DURATION_LIVE = 4000;
const TOAST_DURATION_DISLIVE = 2000;
const TOAST_DURATION = 3000;
const MAX_TOASTS = 3;
const DEBOUNCE = 1500;

let initialized = false;
let startEnabled = false;
let endEnabled = false;
let favoriteEnabled = false;
let favoriteData: FavoriteData = { groups: [] };

// let prevSet: Map<string, string> | null = null;
let debounceTimer: number | undefined;

const extractChannelId = (href: string | null | undefined): string => {
  if (!href) return '';
  return href.match(CHANNEL_ID_REGEX)?.[0] ?? '';
};

const isItemLive = (li: Element, href: string): boolean => {
  if (li.querySelector('[class*="_is_live_"]')) return true;
  return href.includes('/live/');
};

const getChannelName = (li: Element): string => {
  const nameText = li.querySelector('[class*="_name_"] [class*="_text_"]')?.textContent?.trim();
  if (nameText) return nameText;
  return li.querySelector('[class*="_name_"]')?.textContent?.trim() || '';
};

// 프로필 이미지 스냅샷 추출용 (토스트 썸네일로 활용하기 위함)
const getChannelThumbnail = (li: Element): string => {
  // _profile_ 클래스를 가진 요소 내부의 img를 찾음
  const img = li.querySelector('[class*="_profile_"] img');
  return img?.getAttribute('src') || '';
};

/**
 * 변경된 스냅샷 빌더: 썸네일과 URL 추적을 위해 데이터 구조 확장
 * Map<channelId, { name, thumbnail, href }>
 */
interface ChannelSnapshot {
  name: string;
  thumbnail: string;
  href: string;
}
let prevSnapshotSet: Map<string, ChannelSnapshot> | null = null;
/**
 * 팔로잉 nav 에서 "현재 라이브" 채널 집합 스냅샷 빌더
 */
const buildSnapshot = (): Map<string, ChannelSnapshot> => {
  const map = new Map<string, ChannelSnapshot>();
  const navs = document.querySelectorAll(SIDEBAR_MENU);
  if (navs.length < 2) return map;

  navs[1].querySelectorAll('li').forEach(li => {
    // 실제 구조에 맞게 명확한 링크 클래스(_item_link_)로 매칭 보완
    const anchor = li.querySelector('a[class*="_item_link_"]');
    const href = anchor?.getAttribute('href') ?? '';
    const id = extractChannelId(href);

    if (!id || map.has(id)) return;
    if (!isItemLive(li, href)) return;

    map.set(id, {
      name: getChannelName(li),
      thumbnail: getChannelThumbnail(li),
      href: href,
    });
  });
  return map;
};

/* ── 토스트 UI ─────────────────────────────────────────────── */
let toastContainer: HTMLElement | null = null;

const ensureToastContainer = (): HTMLElement => {
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer;

  if (!document.getElementById('czp-toast-style')) {
    const style = document.createElement('style');
    style.id = 'czp-toast-style';
    style.textContent = `
      .czp-toast-container { position: fixed; top: 16px; right: 16px; z-index: 2147483647;
        display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
      
      /* 기본 토스트 스타일 및 레이아웃 수정 */
      .czp-toast { color: #fff; padding: 12px 16px; text-decoration: none;
        border-radius: 8px; font-size: 14px; line-height: 1.4; width: 320px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45); display: flex; gap: 12px; align-items: center;
        opacity: 0; transform: translateX(16px); transition: opacity .25s, transform .25s; }
      
      /* 클릭 가능한 토스트(링크 포함)일 때만 마우스 포인터 활성화 */
      .czp-toast.czp-clickable { pointer-events: auto; cursor: pointer; }
      
      /* 클래스 분기별 배경색 설정 */
      .czp-toast.czp-toast-primary { background: var(--Content-Brand-Base, #00e693); color: #000; border-left: 4px solid #000; }
      .czp-toast.czp-toast-neutral { background: var(--Surface-Neutral-Base, #2e3033); color: #fff; border-left: 4px solid #6c757d; }
      
      /* 애니메이션 상태 */
      .czp-toast.czp-toast-in { opacity: 1; transform: translateX(0); }
      .czp-toast.czp-toast-out { opacity: 0; transform: translateX(16px); }
      
      /* 내부 요소 구성 */
      .czp-toast-thumb { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #555; }
      .czp-toast-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
      .czp-toast-title { font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .czp-toast-desc { font-size: 12px; opacity: 0.8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  toastContainer = document.createElement('div');
  toastContainer.className = 'czp-toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
};

const showToast = (options: ToastOptions): void => {
  const container = ensureToastContainer();

  while (container.childElementCount >= MAX_TOASTS && container.firstElementChild) {
    container.firstElementChild.remove();
  }

  // URL 여부에 따라 a 태그 혹은 div 태그 생성
  const toast = document.createElement(options.url ? 'a' : 'div') as HTMLElement;
  toast.className = `czp-toast czp-toast-${options.variant || 'neutral'}`;

  if (options.url) {
    toast.classList.add('czp-clickable');
    (toast as HTMLAnchorElement).href = options.url;
    (toast as HTMLAnchorElement).target = '_blank'; // 새 창 열기 원치 않으면 제거 가능
  }

  // 썸네일 요소 추가
  if (options.thumbnail) {
    const img = document.createElement('img');
    img.className = 'czp-toast-thumb';
    img.src = options.thumbnail;
    toast.appendChild(img);
  }

  // 텍스트 컨텐츠 컨테이너 추가
  const content = document.createElement('div');
  content.className = 'czp-toast-content';

  const title = document.createElement('div');
  title.className = 'czp-toast-title';
  title.textContent = options.title;
  content.appendChild(title);

  if (options.description) {
    const desc = document.createElement('div');
    desc.className = 'czp-toast-desc';
    desc.textContent = options.description;
    content.appendChild(desc);
  }

  toast.appendChild(content);
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('czp-toast-in'));

  window.setTimeout(() => {
    toast.classList.add('czp-toast-out');
    window.setTimeout(() => toast.remove(), 300);
  }, options.duration || TOAST_DURATION);
};

const notify = (channelId: string, channel: ChannelSnapshot, kind: 'start' | 'end'): void => {
  const isStart = kind === 'start';
  const action = isStart ? '방송 시작' : '방송 종료';

  let prefix = '';
  if (favoriteEnabled) {
    const group = findGroupOfChannel(favoriteData, channelId);
    if (group) prefix = `[${group.name}] `;
  }

  // 요구사항에 따른 신규 스펙 적용
  showToast({
    title: `${prefix}${channel.name}`,
    description: `${action} 알림`,
    thumbnail: channel.thumbnail || undefined,
    url: channel.href ? window.location.origin + channel.href : undefined,
    variant: isStart ? 'primary' : 'neutral', // 시작=primary, 종료=neutral
    duration: isStart ? TOAST_DURATION_LIVE : TOAST_DURATION_DISLIVE,
  });
};

const tick = (): void => {
  if (!startEnabled && !endEnabled) return;

  const current = buildSnapshot();
  if (current.size === 0 && prevSnapshotSet === null) return;

  if (prevSnapshotSet === null) {
    prevSnapshotSet = current;
    return;
  }

  if (startEnabled) {
    for (const [id, channel] of current) {
      if (!prevSnapshotSet.has(id)) notify(id, channel, 'start');
    }
  }
  if (endEnabled) {
    for (const [id, channel] of prevSnapshotSet) {
      if (!current.has(id)) notify(id, channel, 'end');
    }
  }

  prevSnapshotSet = current;
};

const schedule = (): void => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(tick, DEBOUNCE);
};

export const initFollowNotify = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  chrome.storage.local.get([FOLLOW_NOTIFY_START, FOLLOW_NOTIFY_END, FAVORITE_ENABLE], res => {
    startEnabled = !!res[FOLLOW_NOTIFY_START];
    endEnabled = !!res[FOLLOW_NOTIFY_END];
    favoriteEnabled = !!res[FAVORITE_ENABLE];
  });
  favoriteData = await readFavoriteData();

  chrome.storage.onChanged.addListener(changes => {
    if (FOLLOW_NOTIFY_START in changes) startEnabled = !!changes[FOLLOW_NOTIFY_START].newValue;
    if (FOLLOW_NOTIFY_END in changes) endEnabled = !!changes[FOLLOW_NOTIFY_END].newValue;
    if (FAVORITE_ENABLE in changes) favoriteEnabled = !!changes[FAVORITE_ENABLE].newValue;
    if (FAVORITE_GROUPS in changes) favoriteData = parseFavoriteData(changes[FAVORITE_GROUPS].newValue);
  });

  const sidebar = await waitingElement(SIDEBAR, 30000);
  if (!sidebar) return;

  const observer = new MutationObserver(schedule);
  observer.observe(sidebar, { childList: true, subtree: true });

  schedule();
};
