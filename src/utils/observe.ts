import { MESSAGE_PIN_USERS } from "../constants/storage";
import { CHAT_CONTAINER, CHAT_NAME } from "../constants/class";
import { createReactElement, waitingElement } from "./dom";
import { USER_POPUP_CONTENTS } from "../constants/class";
import UserPinButton from "../components/button/UserPinButton/UserPinButton";

export const userPopupObserve = async () => {
  const userPopupOb = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node: Node) => {
        if (node.nodeName === "#text") return;

        let popupContents: Element | null;
        if ((node as Element).matches?.(USER_POPUP_CONTENTS)) {
          popupContents = node as Element;
        } else {
          popupContents = (node as Element).querySelector?.(
            USER_POPUP_CONTENTS
          );
        }

        if (
          popupContents &&
          !popupContents.querySelector("#chzzk-plus-user-pin-btn")
        ) {
          const container = document.createElement("div");
          popupContents.appendChild(container);
          createReactElement(container, UserPinButton);
        }
      });
    });
  });

  const chatContainer = await waitingElement(CHAT_CONTAINER);
  if (chatContainer) {
    userPopupOb.observe(chatContainer, {
      subtree: true,
      childList: true,
    });
  }
};

export const chatObserve = async () => {
  const chatOb = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node: Node) => {
        if (
          !(node instanceof Element) ||
          !node.classList.contains("live_chatting_list_item__0SGhw")
        )
          return;

        const nameElement = node.querySelector(CHAT_NAME);
        const pinListElement = document.querySelector(".czp-message-pin-list");

        if (!nameElement || !pinListElement) return;

        chrome.storage.local.get([MESSAGE_PIN_USERS], (res) => {
          const pinnedUsers = res[MESSAGE_PIN_USERS] || [];

          if (!pinnedUsers.includes(nameElement.textContent)) return;

          const clonedChat = node.cloneNode(true);

          // 고정된 메시지 관리
          if (pinListElement.childElementCount >= 200) {
            pinListElement.removeChild(pinListElement.firstElementChild!);
          }
          pinListElement.appendChild(clonedChat);

          // 새 메시지 도트 표시
          const pinList = document.querySelector(".czp-message-pin-list");
          const newMessageDot = document.getElementById(
            "chzzk-plus-new-message-dot"
          );
          if (
            newMessageDot &&
            pinList &&
            window.getComputedStyle(pinList).display === "none"
          ) {
            newMessageDot.style.display = "inline";
          }
        });
      });
    });
  });

  const chatContainer = await waitingElement(CHAT_CONTAINER);
  if (chatContainer) {
    chatOb.observe(chatContainer, {
      subtree: true,
      childList: true,
    });
  }
};
