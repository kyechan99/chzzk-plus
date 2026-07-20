import { CHAT_CONTAINER } from '../constants/class';
import { CHEEZE_RANKING_REMOVER } from '../constants/storage';

const STYLE_ID = 'czp-cheeze-ranking-remover-style';
const RANKING_SELECTOR = [
  `${CHAT_CONTAINER} [class*="_ranking_"]`,
  `${CHAT_CONTAINER} [class*="ranking"]`,
  `${CHAT_CONTAINER} [class*="_container_"]:has([class*="_ranking_button_"])`,
].join(', ');

const RANKING_TEXT_RE =
  /(?:\uc8fc\uac04).{0,20}(?:\ud6c4\uc6d0|\ud1b5\ub098\ubb34|\ud30c\uc6cc).{0,20}(?:\ub7ad\ud0b9)|(?:weekly).{0,20}(?:ranking)/i;

let enabled = false;
let observer: MutationObserver | null = null;

const ensureStyle = (): void => {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = enabled ? `${RANKING_SELECTOR} { display: none !important; }` : '';
};

const getVisibleText = (element: Element): string => {
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
};

const findRankingRoot = (element: Element): HTMLElement | null => {
  const candidates = [
    element.closest<HTMLElement>('[class*="_container_"]'),
    element.closest<HTMLElement>('section'),
    element.closest<HTMLElement>('article'),
    element.closest<HTMLElement>('div'),
  ];

  return candidates.find(candidate => candidate && candidate.closest(CHAT_CONTAINER)) ?? null;
};

const applyRankingRemoval = (): void => {
  if (!enabled) return;

  const chatContainer = document.querySelector(CHAT_CONTAINER);
  if (!chatContainer) return;

  Array.from(chatContainer.querySelectorAll<HTMLElement>('button, [role="button"], [aria-expanded]')).forEach(element => {
    if (!RANKING_TEXT_RE.test(getVisibleText(element))) return;
    const root = findRankingRoot(element);
    if (root) {
      root.setAttribute('data-czp-ranking-hidden', 'true');
      root.style.setProperty('display', 'none', 'important');
    }
  });
};

const setEnabled = (nextEnabled: boolean): void => {
  enabled = nextEnabled;
  ensureStyle();

  if (!enabled) {
    observer?.disconnect();
    observer = null;
    document.querySelectorAll<HTMLElement>('[data-czp-ranking-hidden="true"]').forEach(element => {
      element.style.removeProperty('display');
      element.removeAttribute('data-czp-ranking-hidden');
    });
    return;
  }

  applyRankingRemoval();
  if (observer) return;

  observer = new MutationObserver(applyRankingRemoval);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export const initCheezeRankingRemover = (): void => {
  chrome.storage.local.get([CHEEZE_RANKING_REMOVER], res => {
    setEnabled(!!res[CHEEZE_RANKING_REMOVER]);
  });

  chrome.storage.onChanged.addListener(changes => {
    if (CHEEZE_RANKING_REMOVER in changes) {
      setEnabled(!!changes[CHEEZE_RANKING_REMOVER].newValue);
    }
  });
};
