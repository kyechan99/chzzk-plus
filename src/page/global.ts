import { previewSetting } from '../feature/preview';
import { chatSetting } from '../feature/chat';
import { favoriteSetting } from '../feature/favorite';
import MessageStorageModal from '../components/modal/messageStorageModal/MessageStorageModal';
import ChatEmojiTagModal from '../components/modal/chatEmojiTagModal/ChatEmojiTagModal';

import { log, logWarning } from '../utils/log';
import { createReactElement } from '../utils/dom';
import { SECTION_TOOLBAR } from '../constants/class';
import { FAVORITE_ENABLE } from '../constants/storage';
import SettingButton from '../components/button/SettingButton/SettingButton';
import SettingModal from '../components/modal/settingModal/SettingModal';

export const editGlobalPage = () => {
  /**
   * 글로벌로 적용시킬만한 내용을 관리합니다.
   * 차후 페이지에 popup과 동일한 컴포넌트를 띄우는데 사용될 수 있어요.
   */
  if (!document.getElementById('czp-global')) {
    const $global = document.createElement('div');
    $global.id = 'czp-global';
    document.body.appendChild($global);

    const $storageModalRoot = document.createElement('div');
    $global.appendChild($storageModalRoot);
    createReactElement($storageModalRoot, MessageStorageModal); // 채팅 저장소

    const $emojiTagModalRoot = document.createElement('div');
    $global.appendChild($emojiTagModalRoot);
    createReactElement($emojiTagModalRoot, ChatEmojiTagModal); // 이모티콘 태그

    const $settingModalRoot = document.createElement('div');
    $global.appendChild($settingModalRoot);
    createReactElement($settingModalRoot, SettingModal); // 세팅
  }

  /*
   * 세팅 버튼
   */
  const $globalToolbar = document.querySelector(SECTION_TOOLBAR);
  if ($globalToolbar && !document.getElementById('czp-golbal-toolbar')) {
    const $tools = document.createElement('div');
    $tools.id = 'czp-golbal-toolbar';
    $globalToolbar?.prepend($tools);
    createReactElement($tools, SettingButton);
  }

  previewSetting();
  chatSetting();

  // 즐겨찾기 정렬은 previewSetting 이 "더보기" 클릭으로 목록을 펼친 뒤 동작하도록 뒤에 호출.
  chrome.storage.local.get(FAVORITE_ENABLE, res => {
    if (res[FAVORITE_ENABLE]) {
      favoriteSetting().catch(logWarning);
    }
  });

  log('GLOBAL PAGE 설정');
};
