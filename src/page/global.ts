import { previewSetting } from '../feature/preview';
import { chatSetting } from '../feature/chat';
import MessageStorageModal from '../components/modal/messageStorageModal/MessageStorageModal';

import { log } from '../utils/log';
import { createReactElement } from '../utils/dom';
import { SECTION_TOOLBAR } from '../constants/class';
import SettingButton from '../components/button/SettingButton/SettingButton';
import SettingModal from '../components/modal/settingModal/SettingModal';

export const editGlobalPage = () => {
  /**
   * 글로벌로 적용시킬만한 내용을 관리합니다.
   * 차후 페이지에 popup과 동일한 컴포넌트를 띄우는데 사용될 수 있어요.
   */
  if (!document.getElementById('chzzk-plus-global')) {
    const $global = document.createElement('div');
    $global.id = 'czp-global';
    document.body.appendChild($global);
    createReactElement($global, MessageStorageModal); // 채팅 저장소
    createReactElement($global, SettingModal); // 세팅
  }

  /*
   * 세팅 버튼
   */
  const $globalToolbar = document.querySelector(SECTION_TOOLBAR);
  if ($globalToolbar && !document.getElementById('chzzk-plus-golbal-toolbar')) {
    const $tools = document.createElement('div');
    $tools.id = 'czp-golbal-toolbar';
    $globalToolbar?.prepend($tools);
    createReactElement($tools, SettingButton);
  }

  previewSetting();
  chatSetting();

  log('GLOBAL PAGE 설정');
};
