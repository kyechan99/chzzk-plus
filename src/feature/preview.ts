import Preview from '../components/video/Preview/Preview';

import { createReactElement, waitingElement } from '../utils/dom';

import {
  CHAT_NAME_COLOR,
  CHAT_TEXT_COLOR,
  COLOR_PROPERTIES,
  FOLLOWING_REFRESH_ENABLE,
  PREVIEW_ENABLE,
} from '../constants/storage';
import { CHAT_NAME_COLOR_DEFAULT, CHAT_TEXT_COLOR_DEFAULT } from '../constants/color';
import { REFRESH_BUTTON, SIDEBAR, SIDEBAR_MENU, STREAMER_MORE_BTN } from '../constants/class';

let refresher: number | undefined;

export async function previewSetting(): Promise<void> {
  const $sidebar = await waitingElement(SIDEBAR);

  // Feat: Preview 썸네일 =====================================================================
  if (!document.getElementById('chzzk-plus-preview')) {
    const $sidebarMenus = $sidebar?.querySelectorAll(SIDEBAR_MENU);
    if ($sidebarMenus && $sidebarMenus?.length > 1) {
      const $followingSidebarMenu = $sidebarMenus[1];
      const moreChannelBtn = $followingSidebarMenu?.querySelector(STREAMER_MORE_BTN) as HTMLButtonElement;

      if (moreChannelBtn) {
        moreChannelBtn.click();

        chrome.storage.local.get(FOLLOWING_REFRESH_ENABLE, res => {
          if (res[FOLLOWING_REFRESH_ENABLE]) {
            clearInterval(refresher);
            refresher = setInterval(() => {
              // REFRESH_BUTTON 은 총 4개지만, 첫번째가 새로고침 버튼임
              const $refreshBtn = document.querySelector(REFRESH_BUTTON) as HTMLElement;
              $refreshBtn.click();
            }, 1000 * 10);
          }
        });
      }
    }

    const $preview = document.createElement('div');
    $preview.id = 'chzzk-plus-preview';
    $sidebar?.appendChild($preview);

    // Feat: 미리보기 설정 ======================================================================
    chrome.storage.local.get(PREVIEW_ENABLE, res => {
      if (res[PREVIEW_ENABLE]) createReactElement($preview, Preview);
    });

    // Feat: 색상 설정 ==========================================================================
    chrome.storage.local.get(COLOR_PROPERTIES, res => {
      // 채팅 이름 및 텍스트 색상 저장되어 있는 값으로 설정
      document.documentElement.style.setProperty(
        `--${CHAT_NAME_COLOR}`,
        res[CHAT_NAME_COLOR] || CHAT_NAME_COLOR_DEFAULT,
      );
      document.documentElement.style.setProperty(
        `--${CHAT_TEXT_COLOR}`,
        res[CHAT_TEXT_COLOR] || CHAT_TEXT_COLOR_DEFAULT,
      );

      if (!res[CHAT_NAME_COLOR])
        chrome.storage.local.set({
          [CHAT_NAME_COLOR]: CHAT_NAME_COLOR_DEFAULT,
        });
      if (!res[CHAT_TEXT_COLOR])
        chrome.storage.local.set({
          [CHAT_TEXT_COLOR]: CHAT_TEXT_COLOR_DEFAULT,
        });
    });

    chrome.storage.onChanged.addListener(changes => {
      // 설정창에서 데이터 변경하면 적용되게
      for (const key in changes) {
        const storageChange = changes[key];

        if (COLOR_PROPERTIES.includes(key))
          document.documentElement.style.setProperty(`--${key}`, storageChange.newValue);
      }
    });
  }
}
