import { log } from '../utils/log';
import { BLOCKED_STREAMER } from '../constants/storage';
import { isCategoryPage } from '../utils/page';
import { blockSetting } from '../feature/block';
import { findVideoCardList } from '../utils/videoList';

export const editCategoryPage = () => {
  if (!isCategoryPage()) return;

  // 차단한 방송 완전 숨기기
  chrome.storage.local.get([BLOCKED_STREAMER], res => {
    if (res[BLOCKED_STREAMER]) {
      const cardList = findVideoCardList();

      if (cardList && cardList.id !== 'chzzk-plus-card-list') {
        cardList.id = 'chzzk-plus-card-list';

        blockSetting(cardList);
      }
    }
  });

  log('LIVE LIST PAGE 설정');
};
