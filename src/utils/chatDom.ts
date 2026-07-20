import {
  CHAT_CONTAINER,
  CHAT_INPUT_EDITABLE,
  CHAT_WRAPPER,
  CHATTING_ACTIONS,
  CHATTING_FIXED_AREA,
  DATA_CHAT_ITEM,
  DATA_CHAT_NICK,
  USER_POPUP_CONTENTS,
} from '../constants/class';

const CHAT_INPUT_SELECTOR =
  'pre[contenteditable="true"], [contenteditable="true"][role="textbox"], [contenteditable="true"], textarea, input';
const STRICT_CHAT_ITEM_SELECTOR = `[${DATA_CHAT_ITEM}], [class*="live_chatting_list_item__"]`;
const CHAT_ITEM_SELECTOR = `${STRICT_CHAT_ITEM_SELECTOR}, [class*="_item_"]`;
const CHAT_WRAPPER_SELECTOR = `${CHAT_WRAPPER}, [class*="_wrapper_"]`;
const USER_POPUP_DIALOG_SELECTOR = '[role="alertdialog"], [role="dialog"], [role="menu"]';
export const CHAT_PIN_FALLBACK_FIXED_CLASS = 'czp-message-pin-fixed-root';
const RANKING_SELECTOR = '[class*="_ranking_"], [class*="ranking"]';
const UNSAFE_NATIVE_CONTENT_CLASS = /ranking/i;

const getElementClassName = (element: Element | null | undefined): string => {
  return typeof element?.className === 'string' ? element.className : '';
};

const isNativeChatFixedArea = (element: Element | null | undefined): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) return false;
  if (element.classList.contains(CHAT_PIN_FALLBACK_FIXED_CLASS)) return false;
  if (element.closest(RANKING_SELECTOR) || element.querySelector(RANKING_SELECTOR)) return false;

  const className = getElementClassName(element);
  if (/ranking/i.test(className)) return false;

  return className.includes('_fixed_') || className.includes('live_chatting_list_fixed__');
};

export const getChatContainer = (): HTMLElement | null => {
  return document.querySelector<HTMLElement>(CHAT_CONTAINER);
};

export const getChatLog = (container: Element = getChatContainer() ?? document.body): HTMLElement | null => {
  return container.querySelector<HTMLElement>('[role="log"]');
};

export const getChatInputEditable = (): HTMLElement | null => {
  const container = getChatContainer();
  return (
    container?.querySelector<HTMLElement>(CHAT_INPUT_SELECTOR) ??
    document.querySelector<HTMLElement>(CHAT_INPUT_EDITABLE) ??
    null
  );
};

export const getChatActionArea = (): HTMLElement | null => {
  const container = getChatContainer();
  const input = getChatInputEditable();
  if (!container || !input) return null;

  const actionArea = container.querySelector<HTMLElement>('[class*="_action_"]');
  if (actionArea) return actionArea;

  const toolsArea = container.querySelector<HTMLElement>('[class*="_tools_"]');
  if (toolsArea) return toolsArea;

  const semanticActionArea = container.querySelector<HTMLElement>(CHATTING_ACTIONS);
  if (semanticActionArea) return semanticActionArea;

  let current: HTMLElement | null = input.parentElement;
  while (current && current !== container) {
    const buttonArea = Array.from(current.querySelectorAll<HTMLElement>('div, span, section')).find(element => {
      return element.querySelectorAll('button').length >= 1 && !element.contains(input);
    });
    if (buttonArea) return buttonArea;
    current = current.parentElement;
  }

  return Array.from(container.querySelectorAll<HTMLElement>('div, section')).find(element => {
    return element.querySelectorAll('button').length >= 2;
  }) ?? null;
};

export const getChatMessageList = (container: Element = getChatContainer() ?? document.body): HTMLElement | null => {
  const roleLog = getChatLog(container) ?? container;

  const wrapper = Array.from(roleLog.querySelectorAll<HTMLElement>(CHAT_WRAPPER_SELECTOR)).find(element => {
    return Array.from(element.children).some(isChatMessageItem);
  });
  if (wrapper) return wrapper;

  const strictItem = roleLog.querySelector<HTMLElement>(STRICT_CHAT_ITEM_SELECTOR);
  if (strictItem?.parentElement && isChatMessageItem(strictItem)) return strictItem.parentElement;

  const firstItem = Array.from(roleLog.querySelectorAll<HTMLElement>(CHAT_ITEM_SELECTOR)).find(isChatMessageItem);
  if (firstItem?.parentElement) return firstItem.parentElement;

  return roleLog instanceof HTMLElement ? roleLog : container.querySelector<HTMLElement>(CHAT_WRAPPER);
};

export const getChatPinnedArea = (container: Element = getChatContainer() ?? document.body): HTMLElement | null => {
  return container.querySelector<HTMLElement>('.czp-message-pin-root');
};

export const getNativeChatFixedArea = (container: Element = getChatContainer() ?? document.body): HTMLElement | null => {
  const roleLog = getChatLog(container) ?? container;
  const previousLogSibling = roleLog.previousElementSibling;
  if (
    previousLogSibling instanceof HTMLElement &&
    previousLogSibling.parentElement === roleLog.parentElement &&
    isNativeChatFixedArea(previousLogSibling)
  ) {
    return previousLogSibling;
  }

  const messageList = getChatMessageList(container);
  const previous = messageList?.previousElementSibling;
  if (previous instanceof HTMLElement && previous.parentElement === messageList?.parentElement && isNativeChatFixedArea(previous)) {
    return previous;
  }

  return (
    Array.from(roleLog.querySelectorAll<HTMLElement>(CHATTING_FIXED_AREA)).find(element => {
      return element.parentElement === messageList?.parentElement && isNativeChatFixedArea(element);
    }) ?? null
  );
};

export const getChatFixedClassName = (container: Element = getChatContainer() ?? document.body): string => {
  const nativeFixed = getNativeChatFixedArea(container);
  const fixedClass = nativeFixed
    ? Array.from(nativeFixed.classList).find(className => className.startsWith('_fixed_'))
    : null;

  return fixedClass ?? nativeFixed?.className ?? CHAT_PIN_FALLBACK_FIXED_CLASS;
};

export const getChatFixedContentClassName = (container: Element = getChatContainer() ?? document.body): string => {
  const nativeFixed = getNativeChatFixedArea(container);
  const nativeContent = Array.from(nativeFixed?.children ?? []).find(element => {
    return element instanceof HTMLElement && !element.classList.contains('czp-message-pin-root');
  }) as HTMLElement | undefined;

  const className = getElementClassName(nativeContent);
  if (!className || UNSAFE_NATIVE_CONTENT_CLASS.test(className)) return '';

  return className
    .split(/\s+/)
    .filter(name => name.includes('_fixed_') || name.includes('live_chatting_fixed_'))
    .join(' ');
};

export const isChatMessageItem = (node: Node): node is HTMLElement => {
  if (!(node instanceof HTMLElement)) return false;
  if (node.closest(RANKING_SELECTOR) || node.querySelector(RANKING_SELECTOR)) return false;
  if (node.hasAttribute(DATA_CHAT_ITEM)) return true;
  if (!node.matches('[class*="live_chatting_list_item__"], [class*="_item_"]')) return false;
  return !!node.querySelector?.(`[${DATA_CHAT_NICK}], [class*="_nickname_"], [class*="live_chatting_message_nickname__"]`);
};

export const getChatNickname = (item: HTMLElement): string | null => {
  const attr = item.getAttribute(DATA_CHAT_NICK);
  if (attr) return attr;

  const nickHolder = item.querySelector<HTMLElement>(`[${DATA_CHAT_NICK}]`);
  const nestedAttr = nickHolder?.getAttribute(DATA_CHAT_NICK);
  if (nestedAttr) return nestedAttr;

  const buttonText = Array.from(item.querySelectorAll<HTMLButtonElement>('button'))
    .map(button => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .find(Boolean);

  return buttonText ?? null;
};

export const findChatNicknameButton = (item: Element): HTMLButtonElement | null => {
  const nickname = item instanceof HTMLElement ? getChatNickname(item) : null;
  const buttons = Array.from(item.querySelectorAll<HTMLButtonElement>('button'));

  if (nickname) {
    const matched = buttons.find(button => (button.textContent ?? '').includes(nickname));
    if (matched) return matched;
  }

  return buttons.find(button => !button.hasAttribute('aria-expanded') && !!button.textContent?.trim()) ?? null;
};

export const findUserPopupContents = (root: Element): Element | null => {
  if (root.matches?.(USER_POPUP_CONTENTS)) return root;
  const legacy = root.querySelector?.(USER_POPUP_CONTENTS);
  if (legacy) return legacy;

  const dialog = findUserPopupDialog(root);
  if (!dialog || !findUserPopupNickname(dialog)) return null;

  return (
    dialog.querySelector('[class*="_list_"], ul, [role="list"], [role="menu"]') ??
    dialog.querySelector('[class*="popup_profile"]') ??
    dialog
  );
};

export const findUserPopupDialog = (root: Element): Element | null => {
  return root.matches?.(USER_POPUP_DIALOG_SELECTOR)
    ? root
    : root.closest?.(USER_POPUP_DIALOG_SELECTOR) ?? root.querySelector?.(USER_POPUP_DIALOG_SELECTOR) ?? null;
};

export const isUserPopupFromChatItem = (root: Element): boolean => {
  const dialog = findUserPopupDialog(root);
  return !!dialog?.parentElement?.closest(`[${DATA_CHAT_ITEM}]`);
};

export const findUserPopupNickname = (root: Element): string | null => {
  const dialog = findUserPopupDialog(root) ?? root;
  const candidates = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      [
        '[class*="live_chatting_popup_profile_name__"]',
        '[class*="_profile_"] [class*="_name_"]',
        '[class*="_name_"] strong',
        'strong [class*="_name_"]',
        '[class*="_nickname_"]',
        'strong',
      ].join(', '),
    ),
  );

  return (
    candidates
      .map(element => element.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .find(text => {
        if (!text || text.length > 40) return false;
        return !/(팔로우|구독|신고|차단|고정|메시지|프로필|Follow|Subscribe|Report|Block)/i.test(text);
      }) ?? null
  );
};
