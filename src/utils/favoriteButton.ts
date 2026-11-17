/**
 * 즐겨찾기 버튼(FavoriteButton) 마운트 공통 로직.
 *
 * 원래 live.ts 안에만 있던 로직이었으나, 라이브 방송 중인 페이지에서만 즐겨찾기 버튼이
 * 노출되어 오프라인 채널/VOD 페이지에서는 즐겨찾기를 추가할 방법이 없는 문제가 있었다.
 * 채널 홈(channel.ts), VOD(video.ts) 페이지에서도 동일하게 재사용할 수 있도록 분리.
 */
import { createReactElement } from './dom';
import FavoriteButton from '../components/button/FavoriteButton/FavoriteButton';

export const FAVORITE_ROOT_ID = 'chzzk-plus-favorite-btn';
type ReactComponent = () => JSX.Element;

export const mountReactRoot = (
  parent: Element | null,
  id: string,
  Component: ReactComponent,
  place: 'prepend' | 'append' = 'prepend',
): Element | null => {
  if (!parent) return null;

  const existing = document.getElementById(id);
  if (existing && parent.contains(existing)) return existing;
  existing?.remove();

  const root = document.createElement('div');
  root.id = id;
  parent[place](root);
  createReactElement(root, Component);
  return root;
};

const getButtonText = (button: HTMLButtonElement): string => {
  return [
    button.textContent,
    button.getAttribute('aria-label'),
    button.getAttribute('title'),
    button.getAttribute('data-tooltip'),
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const findFollowControlMenu = (): Element | null => {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
  const semanticButton = buttons.find(button => {
    const text = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const label = button.getAttribute('aria-label') ?? '';
    return text.includes('구독') || text.includes('팔로우') || label.includes('구독') || label.includes('팔로우');
  });
  if (semanticButton?.parentElement) return semanticButton.parentElement;

  return (
    Array.from(document.querySelectorAll<HTMLElement>('main div, main section')).find(element => {
      const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return element.querySelectorAll('button').length >= 2 && (text.includes('구독') || text.includes('팔로우'));
    }) ?? null
  );
};

const findFollowButton = (): HTMLButtonElement | null => {
  return (
    Array.from(document.querySelectorAll<HTMLButtonElement>('main button')).find(button => {
      const text = getButtonText(button);
      return text.includes('팔로우') || text.includes('팔로잉') || /\bFollow(?:ing)?\b/i.test(text);
    }) ?? null
  );
};

export const findFavoriteMountTarget = (): Element | null => {
  return findFollowButton()?.parentElement ?? findFollowControlMenu();
};

const findFollowStateScope = (mountTarget: Element): Element => {
  return mountTarget.closest('section, article, [class*="_profile_"], [class*="_information_"]') ?? mountTarget;
};

export const isFollowingChannel = (mountTarget: Element): boolean => {
  const scope = findFollowStateScope(mountTarget);
  const buttons = Array.from(scope.querySelectorAll<HTMLButtonElement>('button'));

  return buttons.some(button => {
    const text = getButtonText(button);
    return text.includes('팔로잉') || /\bFollowing\b/i.test(text);
  });
};

export const removeFavoriteButton = (): void => {
  document.getElementById(FAVORITE_ROOT_ID)?.remove();
};

/**
 * 즐겨찾기 버튼을 팔로우 버튼 옆에 붙이거나(조건 충족 시) 제거한다(조건 미충족/기능 비활성 시).
 * live / channel / video 페이지가 동일한 규칙을 공유한다.
 */
export const ensureFavoriteButton = (enabled: boolean): void => {
  if (!enabled) {
    removeFavoriteButton();
    return;
  }

  const $followControl = findFavoriteMountTarget();
  if (!$followControl || !isFollowingChannel($followControl)) {
    removeFavoriteButton();
    return;
  }

  mountReactRoot($followControl, FAVORITE_ROOT_ID, FavoriteButton);
  ($followControl as HTMLElement).style.display = 'flex';
  ($followControl as HTMLElement).style.gap = '6px';
};
