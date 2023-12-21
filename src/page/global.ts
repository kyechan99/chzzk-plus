import Global from "../components/Global";
import Preview from "../components/video/Preview/Preview";

import { log } from "../utils/log";
import { createReactElement } from "../utils/dom";

import {
  CHAT_NAME_COLOR,
  CHAT_TEXT_COLOR,
  COLOR_PROPERTIES,
} from "../constants/storage";
import {
  CHAT_NAME_COLOR_DEFAULT,
  CHAT_TEXT_COLOR_DEFAULT,
} from "../constants/color";

export const editGlobalPage = () => {
  // Feat: Preview 썸네일 =====================================================================
  const $preview = document.createElement("div");
  $preview.id = "chzzk-plus-preview";
  document.body.appendChild($preview);
  createReactElement($preview, Preview);

  // Feat: 색상 설정 ==========================================================================
  chrome.storage.local.get(COLOR_PROPERTIES, (res) => {
    // 채팅 이름 및 텍스트 색상 저장되어 있는 값으로 설정
    document.documentElement.style.setProperty(
      `--${CHAT_NAME_COLOR}`,
      res[CHAT_NAME_COLOR] || CHAT_NAME_COLOR_DEFAULT
    );
    document.documentElement.style.setProperty(
      `--${CHAT_TEXT_COLOR}`,
      res[CHAT_TEXT_COLOR] || CHAT_TEXT_COLOR_DEFAULT
    );

    if (!res[CHAT_NAME_COLOR])
      chrome.storage.local.set({ [CHAT_NAME_COLOR]: CHAT_NAME_COLOR_DEFAULT });
    if (!res[CHAT_TEXT_COLOR])
      chrome.storage.local.set({ [CHAT_TEXT_COLOR]: CHAT_TEXT_COLOR_DEFAULT });
  });

  chrome.storage.onChanged.addListener((changes) => {
    // 설정창에서 데이터 변경하면 적용되게
    for (const key in changes) {
      const storageChange = changes[key];

      if (COLOR_PROPERTIES.includes(key))
        document.documentElement.style.setProperty(
          `--${key}`,
          storageChange.newValue
        );
    }
  });

  /**
   * 글로벌로 적용시킬만한 내용을 관리합니다.
   * 차후 페이지에 popup과 동일한 컴포넌트를 띄우는데 사용될 수 있어요.
   */
  const $global = document.createElement("div");
  $global.id = "chzzk-plus-global";
  document.body.appendChild($global);
  createReactElement($global, Global);

  log("GLOBAL PAGE 설정");
};
