import { createReactElement, waitingElement } from "../utils/dom";
import {
  BLIND_CHAT,
  CHAT_CONTAINER,
  CHAT_MESSAGE,
  CHAT_CONTENT,
  CHAT_NAME,
  CHEEZE_CHAT,
  SUBSCRIBE_CHAT,
  CHEEZE_RANKING_CHAT,
  CHATTING_PIN,
} from "../constants/class";
import {
  BLIND_REMOVER,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_TEXT_COLOR,
  CHEEZE_RANKING_REMOVER,
  CHEEZE_REMOVER,
  MESSAGE_PIN_ENABLE,
  SUBSCRIBE_REMOVER,
} from "../constants/storage";
import PinnedMessageBox from "../components/pinnedMessageBox/PinnedMessageBox";
import { chatObserve, userPopupObserve } from "../utils/observe";

export async function chatSetting(): Promise<void> {
  const chatContainer = await waitingElement(CHAT_CONTAINER);
  chrome.storage.local.get(
    [
      CHAT_COLOR_THEME,
      CHEEZE_REMOVER,
      CHAT_SIZE,
      BLIND_REMOVER,
      SUBSCRIBE_REMOVER,
      CHEEZE_RANKING_REMOVER,
      MESSAGE_PIN_ENABLE,
    ],
    async (res) => {
      if (chatContainer) {
        // 치즈 제거 활성화
        if (res[CHEEZE_REMOVER]) {
          const style = document.createElement("style");
          style.type = "text/css";
          style.innerHTML = `${CHEEZE_CHAT} { display: none; }`;
          document.head.appendChild(style);
        }
        // 주간 후원 랭킹 제거 활성화
        if (res[CHEEZE_RANKING_REMOVER]) {
          const style = document.createElement("style");
          style.type = "text/css";
          style.innerHTML = `${CHEEZE_RANKING_CHAT} { display: none; }`;
          document.head.appendChild(style);
        }
        // 블라인드 챗 제거 활성화
        if (res[BLIND_REMOVER]) {
          const style = document.createElement("style");
          style.type = "text/css";
          style.innerHTML = `${BLIND_CHAT} { display: none; }`;
          document.head.appendChild(style);
        }
        // 구독 챗 제거 활성화
        if (res[SUBSCRIBE_REMOVER]) {
          const style = document.createElement("style");
          style.type = "text/css";
          style.innerHTML = `${SUBSCRIBE_CHAT} { display: none; }`;
          document.head.appendChild(style);
        }

        if (res[CHAT_COLOR_THEME] || res[CHAT_SIZE]) {
          const style = document.createElement("style");
          style.type = "text/css";
          let innerHtml = "";

          // 채팅 크기 설정을 넣고 값이 default 가 아니라면 추가함
          if (res[CHAT_SIZE] && res[CHAT_SIZE] != 14) {
            innerHtml += `${CHAT_MESSAGE} { 
              --czp-fontSize: ${res[CHAT_SIZE]}px;
              font-size: var(--czp-fontSize);
            }`;
          }

          // 채팅 닉네임에 색상 넣기
          if (res[CHAT_COLOR_THEME] && res[CHAT_COLOR_THEME] === "커스텀") {
            innerHtml += `${CHAT_MESSAGE} ${CHAT_NAME} { color: var(--${CHAT_NAME_COLOR}) !important; }`;
          }

          // 채팅 내용에 색상 넣기
          if (res[CHAT_COLOR_THEME] && res[CHAT_COLOR_THEME] === "커스텀") {
            innerHtml += `${CHAT_MESSAGE} ${CHAT_CONTENT} { color: var(--${CHAT_TEXT_COLOR}) !important; }`;
          }

          style.innerHTML = innerHtml;
          document.head.appendChild(style);
        }

        //유저 메시지 고정 기능 추가
        if (res[MESSAGE_PIN_ENABLE]) {
          userPopupObserve();
          chatObserve();

          await waitingElement(`.${CHATTING_PIN}`, 2000);

          //고정된 메시지 박스 추가
          const fixedList = document.querySelector(`.${CHATTING_PIN}`);
          if (fixedList) {
            const container = document.createElement("div");
            fixedList.appendChild(container);
            createReactElement(container, PinnedMessageBox);
          } else {
            const wrapper = document.createElement("div");
            wrapper.className = CHATTING_PIN;
            const chatListContainer = await waitingElement(
              ".live_chatting_list_container__vwsbZ"
            );
            if (chatListContainer) {
              chatListContainer.appendChild(wrapper);
              const container = document.createElement("div");
              wrapper.appendChild(container);
              createReactElement(container, PinnedMessageBox);
            }
          }
        }
      }
    }
  );
}
