import { chatSetting } from "../feature/chat";

// import Barricade from "../components/video/Barricade/Barricade";
import PipButton from "../components/button/PipButton/PipButton";
import LiveHelper from "../components/liveHelper/LiveHelper";
import FastButton from "../components/button/FastButton/FastButton";
import AudioCompressorButton from "../components/button/AudioCompressorButton/AudioCompressorButton";

import { log } from "../utils/log";
import { isLivePage } from "../utils/page";
import { createReactElement } from "../utils/dom";

import {
  VIDEO_BUTTONS,
  PLAYER_LAYOUT_ID,
  LIVE_INFORMATION_HEAD,
} from "../constants/class";
import { FAST_BUTTON, AUDIO_COMPRESSOR } from "../constants/storage";

export const editLivePage = () => {
  if (!isLivePage()) return;

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(PLAYER_LAYOUT_ID);
  if (!$playerLayout) {
    return;
  }

  if (!document.getElementById("chzzk-plus-live-helper")) {
    // Feat: Helper 추가 (즐겨찾기, 녹화, 캡처) =========================================================
    const $infoHeads = document.getElementsByClassName(LIVE_INFORMATION_HEAD);
    if ($infoHeads.length > 0) {
      const $liveTitle = $infoHeads[0] as HTMLElement;
      $liveTitle.style.justifyContent = "space-between";
      const $liveHelper = document.createElement("div");
      $liveHelper.id = "chzzk-plus-live-helper";
      $liveTitle.appendChild($liveHelper);
      createReactElement($liveHelper, LiveHelper);

      // // Feat: 플레이커 키 단축키 활성화 =========================================================
      // chrome.storage.local.get(PLAYER_KEY_CONTROL, (res) => {
      //   // 위에서 pip 버튼 추가 체크로 재생성 걱정은 안해도 괜찮다.
      //   if (res[PLAYER_KEY_CONTROL]) {
      //     document.addEventListener("keydown", (event) => {
      //       const { target } = event;
      //       if (target instanceof HTMLElement)
      //         if (!INPUT_UI_LIST.includes(target.className)) {
      //           // T : 넓은 화면
      //           if (event.key === "t" || event.key === "T") {
      //             const viewModeBtn = document.querySelector(
      //               VIDEO_VIEW_BTN
      //             ) as HTMLElement;
      //             if (viewModeBtn) viewModeBtn.click();
      //           }

      //           // F : 전체 화면
      //           if (event.key === "f" || event.key === "F") {
      //             const fullScreenBtn = document.querySelector(
      //               VIDEO_FULL_BTN
      //             ) as HTMLElement;
      //             if (fullScreenBtn) fullScreenBtn.click();
      //           }
      //           // M : 음소거
      //           if (event.key === "m" || event.key === "M") {
      //             const muteBtn = document.querySelector(
      //               VIDEO_VOLUME_BTN
      //             ) as HTMLElement;
      //             if (muteBtn) muteBtn.click();
      //           }
      //         }
      //     });
      //   }
      // });
    }
  }

  if (!document.getElementById("chzzk-plus-live-btns")) {
    const $btn_list = document.querySelector(VIDEO_BUTTONS);
    // Feat: PIP 버튼 활성화 =========================================================
    const $pipButtonRoot = document.createElement("div");
    $pipButtonRoot.id = "chzzk-plus-live-btns";
    $btn_list?.prepend($pipButtonRoot);
    createReactElement($pipButtonRoot, PipButton);

    chrome.storage.local.get([FAST_BUTTON, AUDIO_COMPRESSOR], (res) => {
      // Feat: 빨리감기 버튼 활성화 =========================================================
      if (res[FAST_BUTTON] && $btn_list) {
        const $videoHelper = document.createElement("div");
        $btn_list?.prepend($videoHelper);
        createReactElement($videoHelper, FastButton);
      }
      // Feat: 오디오 압축 버튼 활성화 =========================================================
      if (res[AUDIO_COMPRESSOR] && $btn_list) {
        const $videoHelper = document.createElement("div");
        $btn_list?.prepend($videoHelper);
        createReactElement($videoHelper, AudioCompressorButton);
      }
    });
  }

  chatSetting();

  log("LIVE PAGE 설정");
};
