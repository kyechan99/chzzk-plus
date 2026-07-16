import { SIDEBAR, SIDEBAR_MENU } from '../constants/class';

const CHANNEL_LINK_REGEX = /^\/(?:live\/|channel\/)?[0-9a-f]{32}(?:[/?#]|$)/i;

const normalizeText = (text: string | null | undefined): string => {
  return text?.replace(/\s+/g, ' ').trim() ?? '';
};

export const getSidebarNavs = (): HTMLElement[] => {
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR);
  if (!sidebar) return [];

  const semanticNavs = Array.from(sidebar.querySelectorAll<HTMLElement>('nav'));
  if (semanticNavs.length > 0) return semanticNavs;

  return Array.from(sidebar.querySelectorAll<HTMLElement>(SIDEBAR_MENU));
};

export const getSidebarNavTitle = (nav: Element): string => {
  const heading = nav.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > strong, :scope > [role="heading"]');
  const headingText = normalizeText(heading?.textContent);
  if (headingText) return headingText;

  const firstChild = Array.from(nav.children).find(child => {
    return child.querySelectorAll('a[href], button').length === 0 && normalizeText(child.textContent);
  });
  return normalizeText(firstChild?.textContent);
};

export const hasChannelLinks = (nav: Element): boolean => {
  return Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href]')).some(anchor => {
    return CHANNEL_LINK_REGEX.test(anchor.getAttribute('href') ?? '');
  });
};

const findButtonByLabels = (root: Element, labels: string[]): HTMLButtonElement | null => {
  return (
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(button => {
      const label = normalizeText(button.getAttribute('aria-label'));
      const text = normalizeText(button.textContent);
      return labels.some(candidate => label.includes(candidate) || text.includes(candidate));
    }) ?? null
  );
};

export const findFollowingNav = (): HTMLElement | null => {
  return (
    getSidebarNavs().find(nav => {
      const title = getSidebarNavTitle(nav);
      const text = normalizeText(nav.textContent);
      return hasChannelLinks(nav) && (title.includes('팔로잉') || text.startsWith('팔로잉'));
    }) ?? null
  );
};

export const findFollowingMoreButton = (): HTMLButtonElement | null => {
  const followingNav = findFollowingNav();
  if (!followingNav) return null;

  const collapsedButtons = Array.from(followingNav.querySelectorAll<HTMLButtonElement>('button[aria-expanded="false"]'));
  return findButtonByLabels(followingNav, ['더보기', 'more']) ?? collapsedButtons[collapsedButtons.length - 1] ?? null;
};

export const findFollowingRefreshButton = (): HTMLButtonElement | null => {
  const followingNav = findFollowingNav();
  if (!followingNav) return null;
  return findButtonByLabels(followingNav, ['새로고침', 'refresh']);
};
