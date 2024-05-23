import { BLOCKED_VIDEO_CARD } from "../constants/class";
import { logWarning } from "../utils/log";

export const blockSetting = (cardList: Element) => {
  Array.from(cardList.children).forEach((node) => {
    const blockedCard = node.querySelector(BLOCKED_VIDEO_CARD) as HTMLElement;
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
};
