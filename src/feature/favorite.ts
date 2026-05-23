import { FAVORITE_GROUPS } from '../constants/storage';
import { NAV_LEFT, STREAMER_MENU } from '../constants/class';
import { waitingElement } from '../utils/dom';
import { logWarning } from '../utils/log';
import {
  FavoriteData,
  parseFavoriteData,
  readFavoriteData,
} from '../utils/favoriteStore';
import { renderFavoriteIconSvg } from '../utils/favoriteIconSvg';

/**
 * 즐겨찾기 그룹을 nav 에 반영한다.
 *
 * 1) 정렬: 그룹 순서대로 묶어서 최상단에 배치. 그룹 내부 및 비-즐겨찾기는 chzzk 기본 순서 유지.
 * 2) 배지: 즐겨찾기 채널의 아이템에 그룹 아이콘 배지 오버레이.
 *
 * 무한 루프 방지 (정렬 + 배지 둘 다 DOM mutation 이라 더 엄격하게):
 *  - 매 스케줄마다 idempotent 작업 먼저 (마커 class, 배지) 실행 후 순서가 동일하면 일찍 종료.
 *  - 배지/순서 모두 desired state 와 비교 후 다를 때만 실제 DOM 갱신.
 *  - 모든 DOM 갱신은 한 RAF 안에 묶어 mutation 폭주 방지.
 */

const FAV_ITEM_CLASS = 'czp-fav-item';
const FAV_BADGE_CLASS = 'czp-fav-nav-badge';
const BADGE_ICON_ATTR = 'data-czp-icon';
const BADGE_COLOR_ATTR = 'data-czp-color';
const CHANNEL_ID_REGEX = /\/(?:live|channel)\/([^/?#]+)/;

let initialized = false;
let scheduled = false;
let cachedData: FavoriteData = { groups: [] };

const extractChannelId = (href: string | null): string => {
  if (!href) return '';
  const m = href.match(CHANNEL_ID_REGEX);
  return m?.[1] ?? '';
};

const getFollowingNav = (): HTMLElement | null => {
  const $navs = document.querySelectorAll(NAV_LEFT);
  return $navs.length >= 2 ? ($navs[1] as HTMLElement) : null;
};

const getFollowingNavList = (): HTMLUListElement | null => {
  return getFollowingNav()?.querySelector('ul') ?? null;
};

interface NavItem {
  el: HTMLElement;
  channelId: string;
  groupIndex: number; // 비-즐겨찾기는 Infinity
  iconId: string | null;
  color: string | null;
}

const buildNavItems = (ul: HTMLUListElement, data: FavoriteData): NavItem[] => {
  // channelId → groupIndex / icon / color 매핑 사전 구축
  const groupIndexById = new Map<string, number>();
  const iconById = new Map<string, string>();
  const colorById = new Map<string, string>();
  data.groups.forEach((g, idx) => {
    g.channelIds.forEach(c => {
      // 동일 채널이 여러 그룹에 잘못 들어있어도 첫 그룹만 채택 (1채널=1그룹 원칙)
      if (!groupIndexById.has(c)) {
        groupIndexById.set(c, idx);
        iconById.set(c, g.icon);
        colorById.set(c, g.color);
      }
    });
  });

  const items: NavItem[] = [];
  Array.from(ul.children).forEach(child => {
    const el = child as HTMLElement;
    const isItem = el.matches(STREAMER_MENU) || !!el.querySelector(STREAMER_MENU);
    if (!isItem) return;
    const anchor = el.matches('a') ? (el as HTMLAnchorElement) : (el.querySelector('a') as HTMLAnchorElement | null);
    const id = extractChannelId(anchor?.getAttribute('href') ?? null);
    const groupIndex = id && groupIndexById.has(id) ? (groupIndexById.get(id) as number) : Number.POSITIVE_INFINITY;
    items.push({
      el,
      channelId: id,
      groupIndex,
      iconId: id ? iconById.get(id) ?? null : null,
      color: id ? colorById.get(id) ?? null : null,
    });
  });
  return items;
};

const syncMarkersAndBadges = (items: NavItem[]): void => {
  items.forEach(({ el, iconId, color }) => {
    const shouldFav = !!iconId;

    // 1. 마커 class (position:relative 부여용)
    if (shouldFav && !el.classList.contains(FAV_ITEM_CLASS)) {
      el.classList.add(FAV_ITEM_CLASS);
    } else if (!shouldFav && el.classList.contains(FAV_ITEM_CLASS)) {
      el.classList.remove(FAV_ITEM_CLASS);
    }

    // 2. 배지
    const existing = el.querySelector(`.${FAV_BADGE_CLASS}`) as HTMLElement | null;
    if (!shouldFav) {
      if (existing) existing.remove();
      return;
    }
    // 아이콘 + 색상 모두 동일하면 건드리지 않음 (idempotent → 옵저버 무한루프 방지)
    if (
      existing &&
      existing.getAttribute(BADGE_ICON_ATTR) === iconId &&
      existing.getAttribute(BADGE_COLOR_ATTR) === (color ?? '')
    ) {
      return;
    }

    if (existing) existing.remove();
    const badge = document.createElement('span');
    badge.className = FAV_BADGE_CLASS;
    badge.setAttribute(BADGE_ICON_ATTR, iconId as string);
    badge.setAttribute(BADGE_COLOR_ATTR, color ?? '');
    if (color) badge.style.background = color;
    badge.innerHTML = renderFavoriteIconSvg(iconId as string, 10);
    el.appendChild(badge);
  });
};

/**
 * 그룹 순서로 stable sort 한 결과를 반환.
 * Array.sort 는 ES2019 부터 stable 이라 같은 priority 면 원본 순서 유지.
 */
const computeDesiredOrder = (items: NavItem[]): NavItem[] => {
  const indexed = items.map((item, idx) => ({ item, idx }));
  indexed.sort((a, b) => {
    if (a.item.groupIndex !== b.item.groupIndex) return a.item.groupIndex - b.item.groupIndex;
    return a.idx - b.idx; // 안정성 보강
  });
  return indexed.map(x => x.item);
};

const isSameOrder = (a: NavItem[], b: NavItem[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].el !== b[i].el) return false;
  }
  return true;
};

const applyOrder = (ul: HTMLUListElement, desired: NavItem[]): void => {
  // appendChild 가 기존 위치에서 분리 후 끝에 붙임. desired 순서대로 차례로 append 하면
  // 비-아이템(헤더, 더보기 버튼 등) 은 자기 위치에 그대로 남는다.
  // 그러나 그러면 비-아이템 위치가 뒤로 밀려나므로 부적절. 대신 DocumentFragment 에
  // 모은 뒤 한 번에 ul 의 가장 앞 비-아이템 직전에 insertBefore.
  const fragment = document.createDocumentFragment();
  desired.forEach(item => fragment.appendChild(item.el));

  // 비-아이템(우리가 추적하지 않은 노드)들이 있다면 그 앞에 fragment 삽입.
  // 모두 아이템이라면 그냥 ul 의 맨 앞으로 삽입.
  // 아이템을 다 떼어낸 ul 의 현재 firstChild 가 곧 비-아이템(또는 null) 이다.
  ul.insertBefore(fragment, ul.firstChild);
};

const scheduleReorder = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    try {
      const ul = getFollowingNavList();
      if (!ul) return;

      const items = buildNavItems(ul, cachedData);
      if (items.length === 0) return;

      // 1) 마커/배지 idempotent 동기화 (변경 없으면 DOM 미터치)
      syncMarkersAndBadges(items);

      // 2) 정렬: 그룹 가진 아이템이 하나도 없으면 스킵
      const hasAnyFavorite = items.some(i => i.iconId !== null);
      if (!hasAnyFavorite) return;

      const desired = computeDesiredOrder(items);
      if (isSameOrder(items, desired)) return;

      applyOrder(ul, desired);
    } catch (err) {
      logWarning(err);
    }
  });
};

export async function favoriteSetting(): Promise<void> {
  // previewSetting 이 "더보기" 클릭으로 목록을 펼친 뒤 호출되는 것이 정상.
  await waitingElement(STREAMER_MENU);

  cachedData = await readFavoriteData();
  scheduleReorder();

  if (initialized) return;
  initialized = true;

  chrome.storage.onChanged.addListener(changes => {
    if (changes[FAVORITE_GROUPS]) {
      cachedData = parseFavoriteData(changes[FAVORITE_GROUPS].newValue);
      scheduleReorder();
    }
  });

  const target = getFollowingNav() ?? document.body;
  const observer = new MutationObserver(() => scheduleReorder());
  observer.observe(target, { childList: true, subtree: true });
}
