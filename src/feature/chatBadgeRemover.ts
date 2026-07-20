import { CHAT_BADGE_REMOVER } from '../constants/storage';
import { CHAT_CONTAINER, DATA_CHAT_ITEM, DATA_CHAT_NICK } from '../constants/class';

const STYLE_ID = 'czp-chat-badge-remover-style';
const CHAT_ITEM_SELECTORS = [`${CHAT_CONTAINER} [${DATA_CHAT_ITEM}]`, `${CHAT_CONTAINER} [class*="live_chatting_list_item__"]`];
const CHAT_ITEM_SELECTOR = CHAT_ITEM_SELECTORS.join(', ');
const NICKNAME_SELECTOR = `[${DATA_CHAT_NICK}], [class*="_nickname_"], [class*="live_chatting_message_nickname__"]`;
const BADGE_SELECTOR = [
  `${CHAT_CONTAINER} [class*="badge"]`,
  `${CHAT_CONTAINER} [class*="_badge_"]`,
  `${CHAT_CONTAINER} [class*="live_chatting_badge"]`,
  ...CHAT_ITEM_SELECTORS.flatMap(itemSelector => [
    `${itemSelector}:has(${NICKNAME_SELECTOR}) [class*="_wrapper_"]:has(img)`,
    `${itemSelector}:has(${NICKNAME_SELECTOR}) [class*="_wrapper_"]:has(svg)`,
  ]),
].join(', ');

let enabled = false;
let observer: MutationObserver | null = null;

const ensureStyle = (): void => {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = enabled ? `${BADGE_SELECTOR} { display: none !important; }` : '';
};

const hideElement = (element: HTMLElement): void => {
  element.setAttribute('data-czp-badge-hidden', 'true');
  element.style.setProperty('display', 'none', 'important');
};

const isLikelyBadgeWrapper = (element: Element): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.matches('[class*="_wrapper_"], [class*="badge"], [class*="_badge_"]')) return false;
  if (element.matches(NICKNAME_SELECTOR) || element.querySelector(NICKNAME_SELECTOR)) return false;
  return !!element.querySelector('img, svg');
};

const hideSiblingBadgeWrappers = (item: Element): void => {
  const nickname = item.querySelector(NICKNAME_SELECTOR);
  const parent = nickname?.parentElement;
  if (!parent) return;

  Array.from(parent.children).forEach(child => {
    if (child === nickname) return;
    if (isLikelyBadgeWrapper(child)) hideElement(child);
  });
};

const applyBadgeRemoval = (): void => {
  if (!enabled) return;

  document.querySelectorAll<HTMLElement>(BADGE_SELECTOR).forEach(hideElement);
  document.querySelectorAll(CHAT_ITEM_SELECTOR).forEach(hideSiblingBadgeWrappers);
};

const restoreHiddenBadges = (): void => {
  document.querySelectorAll<HTMLElement>('[data-czp-badge-hidden="true"]').forEach(element => {
    element.style.removeProperty('display');
    element.removeAttribute('data-czp-badge-hidden');
  });
};

const setEnabled = (nextEnabled: boolean): void => {
  enabled = nextEnabled;
  ensureStyle();

  if (!enabled) {
    observer?.disconnect();
    observer = null;
    restoreHiddenBadges();
    return;
  }

  applyBadgeRemoval();
  if (observer) return;

  observer = new MutationObserver(applyBadgeRemoval);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
};

export const initChatBadgeRemover = (): void => {
  chrome.storage.local.get([CHAT_BADGE_REMOVER], res => {
    setEnabled(!!res[CHAT_BADGE_REMOVER]);
  });

  chrome.storage.onChanged.addListener(changes => {
    if (CHAT_BADGE_REMOVER in changes) {
      setEnabled(!!changes[CHAT_BADGE_REMOVER].newValue);
    }
  });
};
