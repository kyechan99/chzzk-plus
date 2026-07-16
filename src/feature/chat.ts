import { createReactElement, waitingElement } from '../utils/dom';
import { CHAT_CONTAINER } from '../constants/class';
import { MESSAGE_PIN_ENABLE } from '../constants/storage';
import PinnedMessageBox from '../components/pinnedMessageBox/PinnedMessageBox';
import { chatObserve, userPopupObserve } from '../utils/observe';
import { delay } from '../utils/time';
import {
  getChatFixedClassName,
  getChatFixedContentClassName,
  getChatMessageList,
  getChatPinnedArea,
  getNativeChatFixedArea,
} from '../utils/chatDom';

let pinBoxMounting = false;

/**
 * 채팅 관련 DOM 의존 기능(메시지 고정)을 설정한다.
 *
 * 순수 CSS 로 끝나는 기능(치즈/블라인드/구독/뱃지 숨김, 채팅 크기/색상)은 깜빡임 없이
 * 즉시 적용되도록 src/earlyStyle.ts(document_start) 로 분리되었다.
 */
export async function chatSetting(): Promise<void> {
  const chatContainer = await waitingElement(CHAT_CONTAINER);
  if (!chatContainer) return;

  chrome.storage.local.get([MESSAGE_PIN_ENABLE], async res => {
    await delay(1000);

    if (!res[MESSAGE_PIN_ENABLE]) return;

    userPopupObserve();
    chatObserve();

    // 가드는 React 가 비동기로 렌더하는 #chzzk-plus-message-pin 대신, 생성 즉시 동기적으로
    // 존재하는 마커(.czp-message-pin-root)로 검사해야 중복 생성을 막을 수 있다.
    if (pinBoxMounting || chatContainer.querySelector('.czp-message-pin-root')) return;
    pinBoxMounting = true;

    try {
      if (getChatPinnedArea(chatContainer)) return;

      let nativeFixed = getNativeChatFixedArea(chatContainer);
      const chatWrapper = getChatMessageList(chatContainer);
      if (!nativeFixed && chatWrapper) {
        nativeFixed = document.createElement('div');
        nativeFixed.className = getChatFixedClassName(chatContainer);
        chatWrapper.insertAdjacentElement('beforebegin', nativeFixed);
      }

      if (nativeFixed) {
        const contentClassName = getChatFixedContentClassName(chatContainer);
        const pinRoot = document.createElement('div');
        pinRoot.className = ['czp-message-pin-root', contentClassName].filter(Boolean).join(' ');

        createReactElement(pinRoot, PinnedMessageBox);
        nativeFixed.appendChild(pinRoot);
      }
    } finally {
      pinBoxMounting = false;
    }
  });
}
