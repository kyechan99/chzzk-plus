import { BLOCKED_VIDEO_CARD, VIDEO_CARD_LIST, VIDEO_CARD_LIST_CT } from '../constants/class';

const VIDEO_LINK_SELECTOR = 'a[href*="/live/"], a[href*="/video/"], a[href*="/category/"]';

const getScore = (element: Element): number => {
  const childCount = element.children.length;
  const linkCount = element.querySelectorAll(VIDEO_LINK_SELECTOR).length;
  return childCount + linkCount * 2;
};

export const findVideoCardList = (): HTMLElement | null => {
  const legacy = document.querySelector<HTMLElement>(`${VIDEO_CARD_LIST}, ${VIDEO_CARD_LIST_CT}`);
  if (legacy) return legacy;

  const candidates = Array.from(document.querySelectorAll<HTMLElement>('main ul, main section, main div'))
    .filter(element => element.querySelectorAll(VIDEO_LINK_SELECTOR).length >= 2)
    .filter(element => {
      const children = Array.from(element.children);
      return children.length >= 2 && children.some(child => child.querySelector(VIDEO_LINK_SELECTOR));
    })
    .sort((a, b) => getScore(b) - getScore(a));

  return candidates[0] ?? null;
};

export const hasBlockedMarker = (element: Element): boolean => {
  if (element.querySelector(BLOCKED_VIDEO_CARD)) return true;
  const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return text.includes('차단');
};
