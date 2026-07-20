import { CHAT_CONTAINER, DATA_CHAT_ITEM } from '../constants/class';
import { CHAT_NAME_COLOR_DEFAULT, CHAT_TEXT_COLOR_DEFAULT } from '../constants/color';
import { CHAT_COLOR_THEME, CHAT_NAME_COLOR, CHAT_TEXT_COLOR } from '../constants/storage';
import { findChatNicknameButton, getChatNickname, isChatMessageItem } from '../utils/chatDom';

const CHAT_ITEM_SELECTOR = `${CHAT_CONTAINER} [${DATA_CHAT_ITEM}], ${CHAT_CONTAINER} [class*="live_chatting_list_item__"], ${CHAT_CONTAINER} [class*="_item_"]`;
const CONTENT_CANDIDATE_SELECTOR = [
  '[class*="live_chatting_message_text__"]',
  '[class*="_message_"]',
  '[class*="_content_"]',
  '[class*="_text_"]',
].join(', ');
const STYLED_ATTR = 'data-czp-chat-color-styled';

let started = false;
let enabled = false;
let nameColor = CHAT_NAME_COLOR_DEFAULT;
let textColor = CHAT_TEXT_COLOR_DEFAULT;
let observer: MutationObserver | null = null;
let observedTarget: Element | null = null;

const setImportantColor = (element: HTMLElement, color: string): void => {
  element.setAttribute(STYLED_ATTR, 'true');
  element.style.setProperty('color', color, 'important');
};

const clearAppliedColors = (): void => {
  document.querySelectorAll<HTMLElement>(`[${STYLED_ATTR}="true"]`).forEach(element => {
    element.style.removeProperty('color');
    element.removeAttribute(STYLED_ATTR);
  });
};

const isContentElement = (element: HTMLElement, item: HTMLElement, nicknameButton: HTMLButtonElement | null): boolean => {
  if (nicknameButton && (element === nicknameButton || nicknameButton.contains(element))) return false;
  if (element.closest('button')) return false;
  if (element.classList.contains('czp-chat-timestamp')) return false;
  if (element.closest('[data-czp-badge-hidden="true"]')) return false;
  if (element.querySelector('button')) return false;

  const nickname = getChatNickname(item);
  const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  if (nickname && text === nickname) return false;

  return !!text;
};

const applyItemColor = (item: HTMLElement): void => {
  if (!enabled || !isChatMessageItem(item)) return;

  const nicknameButton = findChatNicknameButton(item);
  if (nicknameButton) {
    setImportantColor(nicknameButton, nameColor);
    nicknameButton.querySelectorAll<HTMLElement>('*').forEach(element => setImportantColor(element, nameColor));
  }

  Array.from(item.querySelectorAll<HTMLElement>(CONTENT_CANDIDATE_SELECTOR)).forEach(element => {
    if (isContentElement(element, item, nicknameButton)) setImportantColor(element, textColor);
  });
};

const applyAllColors = (): void => {
  if (!enabled) return;

  Array.from(document.querySelectorAll<HTMLElement>(CHAT_ITEM_SELECTOR)).forEach(item => {
    if (isChatMessageItem(item)) applyItemColor(item);
  });
};

const startObserver = (): void => {
  const container = document.querySelector(CHAT_CONTAINER);
  if (!container) return;
  if (observer && observedTarget === container) return;

  observer?.disconnect();
  observedTarget = container;
  observer = new MutationObserver(mutations => {
    if (!enabled) return;

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        applyItemColor(node);
        node.querySelectorAll<HTMLElement>(CHAT_ITEM_SELECTOR).forEach(item => applyItemColor(item));
      });
    });
  });
  observer.observe(container, { childList: true, subtree: true });
};

const refresh = (): void => {
  chrome.storage.local.get([CHAT_COLOR_THEME, CHAT_NAME_COLOR, CHAT_TEXT_COLOR], res => {
    enabled = res[CHAT_COLOR_THEME] === '커스텀';
    nameColor = res[CHAT_NAME_COLOR] || CHAT_NAME_COLOR_DEFAULT;
    textColor = res[CHAT_TEXT_COLOR] || CHAT_TEXT_COLOR_DEFAULT;

    document.documentElement.style.setProperty(`--${CHAT_NAME_COLOR}`, nameColor);
    document.documentElement.style.setProperty(`--${CHAT_TEXT_COLOR}`, textColor);
    clearAppliedColors();

    if (!enabled) {
      observer?.disconnect();
      observer = null;
      observedTarget = null;
      return;
    }

    applyAllColors();
    startObserver();
  });
};

export const initChatColor = (): void => {
  if (started) return;
  started = true;

  refresh();
  chrome.storage.onChanged.addListener(changes => {
    if (CHAT_COLOR_THEME in changes || CHAT_NAME_COLOR in changes || CHAT_TEXT_COLOR in changes) refresh();
  });
};
