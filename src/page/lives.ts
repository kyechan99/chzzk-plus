import { log, logWarning } from "../utils/log";
import { BLOCKED_STREAMER } from "../constants/storage";
import { BLOCKED_VIDEO_CARD, VIDEO_CARD_LIST } from "../constants/class";
import { isLiveListPage } from "../utils/page";

export const editLiveListPage = () => {
  if (!isLiveListPage()) return;

  // 차단한 방송 완전 숨기기
  chrome.storage.local.get([BLOCKED_STREAMER], (res) => {
    const cardList = document.querySelector(VIDEO_CARD_LIST);

    if (res[BLOCKED_STREAMER]) {
      if (cardList && cardList.id !== "chzzk-plus-card-list") {
        cardList.id = "chzzk-plus-card-list";

        Array.from(cardList.children).forEach((node) => {
          const blockedCard = node.querySelector(
            BLOCKED_VIDEO_CARD
          ) as HTMLElement;
          if (blockedCard) {
            blockedCard.parentElement?.remove();
          }
        });

        try {
          const observer = new MutationObserver(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (mutationList, _observer) => {
              for (const mutation of mutationList) {
                for (const addedNode of mutation.addedNodes as NodeListOf<HTMLElement>) {
                  const blockedCard = addedNode.querySelector(
                    BLOCKED_VIDEO_CARD
                  ) as HTMLElement;

                  console.log(addedNode);
                  if (blockedCard) {
                    blockedCard.parentElement?.remove();
                  }
                }
              }
            }
          );

          observer.observe(cardList, {
            childList: true,
            subtree: true,
          });
        } catch (err) {
          logWarning(err);
        }
      }
    }
  });

  log("LIVE LIST PAGE 설정");
};
