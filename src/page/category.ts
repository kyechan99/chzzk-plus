import { log } from "../utils/log";
import { BLOCKED_STREAMER } from "../constants/storage";
import { VIDEO_CARD_LIST_CT } from "../constants/class";
import { isCategoryPage } from "../utils/page";
import { blockSetting } from "../feature/block";

export const editCategoryPage = () => {
  if (!isCategoryPage()) return;

  // 차단한 방송 완전 숨기기
  chrome.storage.local.get([BLOCKED_STREAMER], (res) => {
    if (res[BLOCKED_STREAMER]) {
      const cardList = document.querySelector(VIDEO_CARD_LIST_CT);

      if (cardList && cardList.id !== "chzzk-plus-card-list") {
        cardList.id = "chzzk-plus-card-list";

        blockSetting(cardList);
      }
    }
  });

  log("LIVE LIST PAGE 설정");
};
