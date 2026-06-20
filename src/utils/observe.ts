import { MESSAGE_PIN_USERS } from '../constants/storage';
import { CHAT_CONTAINER, CHAT_ITEM, CHAT_NAME, DATA_CHAT_ITEM, DATA_CHAT_NICK } from '../constants/class';
import { createReactElement, waitingElement } from './dom';
import { USER_POPUP_CONTENTS } from '../constants/class';
import UserPinButton from '../components/button/UserPinButton/UserPinButton';

const CHAT_ITEM_FALLBACK = `${CHAT_ITEM}, [class*="live_chatting_list_item__"]`;
const CHAT_NAME_FALLBACK = [CHAT_NAME, '[class*="live_chatting_message_nickname__"]', '[class*="_nickname_"]'];

// inject.js(MAIN world)가 fiber 로 찍은 data-czp-* 속성을 우선 사용하고,
// 속성이 없으면(주입 실패/타이밍) 클래스 폴백으로 자동 degrade
const isChatItem = (node: Node): node is HTMLElement => {
  if (!(node instanceof HTMLElement)) return false;
  if (node.hasAttribute(DATA_CHAT_ITEM)) return true;
  return node.matches(CHAT_ITEM_FALLBACK);
};

const getChatNickname = (el: HTMLElement): string | null => {
  for (const selector of CHAT_NAME_FALLBACK) {
    const text = el.querySelector(selector)?.textContent;
    if (text) return text;
  }
  return el.getAttribute(DATA_CHAT_NICK);
};

// 옵저버 싱글톤 + 재타겟팅
// chatSetting 은 self-healing 재조정으로 여러 번 호출되므로, 매번 새 옵저버를 만들면 옵저버가
// 쌓여 같은 메시지가 중복 복제된다. 같은 컨테이너면 재설정을 건너뛰고, 채팅이 껐다 켜져
// 컨테이너가 새로 생기면 이전 옵저버를 끊고 새 컨테이너에 다시 붙인다.
let userPopupOb: MutationObserver | null = null;
let userPopupTarget: Element | null = null;
let chatOb: MutationObserver | null = null;
let chatTarget: Element | null = null;

export const userPopupObserve = async () => {
  const chatContainer = await waitingElement(CHAT_CONTAINER);
  if (!chatContainer) return;
  if (userPopupTarget === chatContainer && userPopupOb) return;

  userPopupOb?.disconnect();
  userPopupTarget = chatContainer;
  userPopupOb = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach((node: Node) => {
        if (node.nodeName === '#text') return;

        let popupContents: Element | null;
        if ((node as Element).matches?.(USER_POPUP_CONTENTS)) {
          popupContents = node as Element;
        } else {
          popupContents = (node as Element).querySelector?.(USER_POPUP_CONTENTS);
        }

        if (popupContents && !popupContents.querySelector('#chzzk-plus-user-pin-btn')) {
          const container = document.createElement('div');
          container.id = 'chzzk-plus-user-pin-btn';
          popupContents.appendChild(container);
          createReactElement(container, UserPinButton);
        }
      });
    });
  });
  userPopupOb.observe(chatContainer, { subtree: true, childList: true });
};

export const chatObserve = async () => {
  // 관찰 대상을 난독화된 내부 wrapper(_wrapper_sg7hy_25) 대신 안정적인 CHAT_CONTAINER 으로.
  // subtree:true 라 깊숙이 추가되는 채팅 아이템도 모두 포착되고, isChatItem 으로 필터링한다.
  const chatContainer = await waitingElement(CHAT_CONTAINER);
  if (!chatContainer) return;
  if (chatTarget === chatContainer && chatOb) return;

  chatOb?.disconnect();
  chatTarget = chatContainer;
  chatOb = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach((node: Node) => {
        if (!isChatItem(node)) return;

        // 우리 핀 박스 안에 복제되어 들어간 노드(복제본)는 무시한다.
        // (관찰 대상 CHAT_CONTAINER 안에 핀 박스가 있어, 막지 않으면 복제→감지→재복제 무한 루프)
        if (node.closest('#chzzk-plus-message-pin')) return;

        const nickname = getChatNickname(node);
        const pinListElement = chatContainer.querySelector('.czp-message-pin-list');

        if (!nickname || !pinListElement) return;

        chrome.storage.local.get([MESSAGE_PIN_USERS], res => {
          const pinnedUsers = res[MESSAGE_PIN_USERS] || [];

          if (!pinnedUsers.includes(nickname)) return;

          const clonedChat = node.cloneNode(true) as HTMLElement;

          // 가상 스크롤 등으로 붙은 inline 위치 스타일을 제거해, 박스 안에서 정상 흐름으로 보이게 한다.
          clonedChat.style.position = 'static';
          clonedChat.style.transform = 'none';
          clonedChat.style.top = 'auto';
          clonedChat.style.left = 'auto';
          clonedChat.style.width = '100%';

          // 고정된 메시지 관리
          if (pinListElement.childElementCount >= 200) {
            pinListElement.removeChild(pinListElement.firstElementChild!);
          }
          pinListElement.appendChild(clonedChat);

          // 새 메시지 도트 표시
          const pinList = document.querySelector('.czp-message-pin-list');
          const newMessageDot = document.getElementById('chzzk-plus-new-message-dot');
          if (newMessageDot && pinList && window.getComputedStyle(pinList).display === 'none') {
            newMessageDot.style.display = 'inline';
          }
        });
      });
    });
  });
  chatOb.observe(chatContainer, { subtree: true, childList: true });
};
