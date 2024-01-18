// import { getNameColor } from "../utils/color";
import { logError } from "../utils/log";
import { waitingElement } from "../utils/dom";
import {
  CHAT_CONTAINER,
  CHAT_CONTENT,
  CHAT_NAME,
  CHEEZE_CHAT,
} from "../constants/class";
import {
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_TEXT_COLOR,
  CHEEZE_REMOVER,
} from "../constants/storage";

export async function chatSetting(): Promise<void> {
  await waitingElement(`.${CHAT_CONTAINER}`);

  // Feat: 채팅 색상, 치즈 제거 ===============================================================
  chrome.storage.local.get(
    [CHAT_COLOR_THEME, CHEEZE_REMOVER, CHAT_SIZE],
    (res) => {
      const chatContainer = document.querySelector(
        `div[class*="${CHAT_CONTAINER}"]`
      );

      if (chatContainer) {
        if (res[CHAT_COLOR_THEME] || res[CHEEZE_REMOVER] || res[CHAT_SIZE]) {
          try {
            const observer = new MutationObserver(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              (mutationList, _observer) => {
                for (const mutation of mutationList) {
                  for (const addedNode of mutation.addedNodes as NodeListOf<HTMLElement>) {
                    // 치즈 제거 활성화
                    if (res[CHEEZE_REMOVER]) {
                      if (addedNode.className === CHEEZE_CHAT) {
                        addedNode.style.display = "none";
                        continue;
                      }
                    }

                    const nickname = addedNode.querySelector(
                      CHAT_NAME
                    ) as HTMLElement;
                    const text = addedNode.querySelector(
                      CHAT_CONTENT
                    ) as HTMLElement;

                    if (text) {
                      // 채팅 색상 넣기
                      if (
                        res[CHAT_COLOR_THEME] &&
                        res[CHAT_COLOR_THEME] === "커스텀"
                      ) {
                        text.style.color = `var(--${CHAT_TEXT_COLOR})`;
                      }
                      // 채팅 크기 넣기
                      if (res[CHAT_SIZE]) {
                        text.style.fontSize = `${res[CHAT_SIZE]}px`;
                      }
                    }

                    if (nickname) {
                      // 이름 커스텀 넣기
                      if (
                        res[CHAT_COLOR_THEME] &&
                        res[CHAT_COLOR_THEME] === "커스텀"
                      ) {
                        nickname.style.color = `var(--${CHAT_NAME_COLOR})`;
                      }
                      if (res[CHAT_SIZE]) {
                        nickname.style.fontSize = `${res[CHAT_SIZE]}px`;
                      }
                    }
                  }
                }
              }
            );

            observer.observe(chatContainer, {
              childList: true,
              subtree: true,
            });
          } catch (err) {
            logError(err);
          }
        }
      }
    }
  );
}
