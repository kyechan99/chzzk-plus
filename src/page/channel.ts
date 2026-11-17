/**
 * 채널 홈 페이지 (방송 중이 아닌 상태 포함) 설정.
 *
 * 기존에는 즐겨찾기 버튼이 live.ts(라이브 방송 페이지)에만 마운트되어 있어,
 * 방송 중이 아닌 스트리머는 즐겨찾기(그룹 배정)에 추가할 방법이 UI상 없었다.
 * 채널 홈에서도 동일한 팔로우 버튼 옆에 즐겨찾기 버튼을 노출해 그 틈을 메운다.
 */
import { log } from '../utils/log';
import { isChannelPage } from '../utils/page';
import { FAVORITE_ENABLE } from '../constants/storage';
import { ensureFavoriteButton } from '../utils/favoriteButton';

export const editChannelPage = () => {
  if (!isChannelPage()) return;

  // Feat: 즐겨찾기 버튼 (채널 홈, 오프라인 포함) ==============================================
  chrome.storage.local.get([FAVORITE_ENABLE], res => {
    ensureFavoriteButton(!!res[FAVORITE_ENABLE]);
  });

  log('CHANNEL PAGE 설정');
};
