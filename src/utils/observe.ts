import { MESSAGE_PIN_USERS } from "../constants/storage";
import { CHAT_CONTAINER, CHAT_NAME } from "../constants/class";
import { createReactElement, waitingElement } from "./dom";
import { USER_POPUP_CONTENTS } from "../constants/class";
import UserPinButton from "../components/button/UserPinButton/UserPinButton";

export const userPopupObserve = () => {
  const userPopupOb = new MutationObserver(async () => {
    await waitingElement(USER_POPUP_CONTENTS);

    const userPopupContents = document.querySelector(USER_POPUP_CONTENTS);
    if (
      userPopupContents &&
      !document.getElementById("chzzk-plus-user-pin-btn")
    ) {
      const container = document.createElement("div");
      userPopupContents.appendChild(container);
      createReactElement(container, UserPinButton);
    }
  });

  const chatContainer = document.querySelector(CHAT_CONTAINER);
  if (chatContainer) {
    userPopupOb.observe(chatContainer, {
      subtree: true,
      childList: true,
    });
  }
};

export const chatObserve = () => {
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

  const chatContainer = document.querySelector(CHAT_CONTAINER);
  if (chatContainer) {
    chatOb.observe(chatContainer, {
      subtree: true,
      childList: true,
    });
  }
};
