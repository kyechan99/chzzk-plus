import Preview from "../components/video/Preview/Preview";

import { createReactElement, waitingElement } from "../utils/dom";

import {
  CHAT_NAME_COLOR,
  CHAT_TEXT_COLOR,
  COLOR_PROPERTIES,
  FOLLOWING_REFRESH_ENABLE,
} from "../constants/storage";
import {
  CHAT_NAME_COLOR_DEFAULT,
  CHAT_TEXT_COLOR_DEFAULT,
} from "../constants/color";
import { NAVIGATOR_BUTTON, STREAMER_MENU } from "../constants/class";

let refresher: number | undefined;

export async function previewSetting(): Promise<void> {
  await waitingElement(STREAMER_MENU);

  // Feat: Preview 썸네일 =====================================================================
  if (!document.getElementById("chzzk-plus-preview")) {
    const moreChannelBtnList = document.getElementsByClassName(
      "navigator_button_more__UE0v3"
    );
    if (moreChannelBtnList.length > 0) {
      // 팔로우 채널 더보기 클릭.  만약 팔로워가 없다면 추천 채널 더보기 클릭
      const moreChannelBtn = moreChannelBtnList[0] as HTMLElement;
      moreChannelBtn.click();

      chrome.storage.local.get(FOLLOWING_REFRESH_ENABLE, (res) => {
        if (res[FOLLOWING_REFRESH_ENABLE]) {
          clearInterval(refresher);
          refresher = setInterval(() => {
            // NAVIGATOR_BUTTON 은 총 4개지만, 첫번째가 새로고침 버튼임
            const $refreshBtn = document.querySelector(
              NAVIGATOR_BUTTON
            ) as HTMLElement;
            $refreshBtn.click();
          }, 1000 * 30);
        }
      });
    }

    const $preview = document.createElement("div");
    $preview.id = "chzzk-plus-preview";
    document.querySelector(STREAMER_MENU)?.appendChild($preview);
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
        chrome.storage.local.set({
          [CHAT_NAME_COLOR]: CHAT_NAME_COLOR_DEFAULT,
        });
      if (!res[CHAT_TEXT_COLOR])
        chrome.storage.local.set({
          [CHAT_TEXT_COLOR]: CHAT_TEXT_COLOR_DEFAULT,
        });
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
  }
}
