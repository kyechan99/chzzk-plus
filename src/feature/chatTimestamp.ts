/**
 * 채팅 타임스탬프.
 *
 * 채팅이 새로 생길 때, 닉네임 버튼 맨 앞에 현재 시각(czp-chat-timestamp)을 삽입한다.
 *   <button class="_nickname_...">
 *     <span class="czp-chat-timestamp">00:09:26</span>
 *     <span>...닉네임...</span>
 *   </button>
 *
 * 기존(백로그) 채팅은 실제 작성 시각을 알 수 없으므로 새로 도착하는 채팅만 표기한다.
 */
import { CHAT_CONTAINER } from '../constants/class';
import { CHAT_TIMESTAMP_ENABLE } from '../constants/storage';
import { waitingElement } from '../utils/dom';
import { findChatNicknameButton, isChatMessageItem } from '../utils/chatDom';

const CLASS = 'czp-chat-timestamp';
const STYLE_ID = 'czp-chat-timestamp-style';

let started = false;
let enabled = false;
let observer: MutationObserver | null = null;
let observedTarget: Element | null = null;

const pad = (n: number): string => String(n).padStart(2, '0');
const nowTime = (): string => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const ensureStyle = (): void => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `.${CLASS} { margin-right: 4px; font-size: 11px; color: var(--color-content-05, #94969c); font-variant-numeric: tabular-nums; }`;
  (document.head || document.documentElement).appendChild(style);
};

const stampButton = (btn: Element): void => {
  if (btn.querySelector(`:scope > .${CLASS}`)) return;
  const span = document.createElement('span');
  span.className = CLASS;
  span.textContent = nowTime();
  btn.prepend(span);
};

const stampWithin = (node: Element): void => {
  if (isChatMessageItem(node)) {
    const button = findChatNicknameButton(node);
    if (button) stampButton(button);
    return;
  }

  node
    .querySelectorAll?.('[data-czp-chat-item], [class*="live_chatting_list_item__"], [class*="_item_"]')
    .forEach(item => {
      if (!isChatMessageItem(item)) return;
      const button = findChatNicknameButton(item);
      if (button) stampButton(button);
    });
};

const startObserver = async (): Promise<void> => {
  if (!enabled) return;
  const container = await waitingElement(CHAT_CONTAINER);
  if (!container) return;
  if (observedTarget === container && observer) return; // 이미 관찰 중

  observer?.disconnect();
  observedTarget = container;
  ensureStyle();

  observer = new MutationObserver(mutations => {
    if (!enabled) return;
    mutations.forEach(m =>
      m.addedNodes.forEach(n => {
        if (n instanceof Element) stampWithin(n);
      }),
    );
  });
  observer.observe(container, { childList: true, subtree: true });
};

const stopObserver = (): void => {
  observer?.disconnect();
  observer = null;
  observedTarget = null;
  document.querySelectorAll(`.${CLASS}`).forEach(el => el.remove());
};

/** 라이브 페이지 진입/재구성 시 호출 (채팅 컨테이너가 새로 생기면 재관찰). */
export const chatTimestampSetting = (): void => {
  if (enabled) startObserver();
};

export const initChatTimestamp = (): void => {
  if (started) return;
  started = true;

  chrome.storage.local.get([CHAT_TIMESTAMP_ENABLE], res => {
    enabled = !!res[CHAT_TIMESTAMP_ENABLE];
    if (enabled) startObserver();
  });

  chrome.storage.onChanged.addListener(changes => {
    if (CHAT_TIMESTAMP_ENABLE in changes) {
      enabled = !!changes[CHAT_TIMESTAMP_ENABLE].newValue;
      if (enabled) startObserver();
      else stopObserver();
    }
  });
};
