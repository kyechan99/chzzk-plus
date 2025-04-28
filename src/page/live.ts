// import Barricade from "../components/video/Barricade/Barricade";
import FastButton from "../components/button/FastButton/FastButton";
import AudioCompressorButton from "../components/button/AudioCompressorButton/AudioCompressorButton";

import { log } from "../utils/log";
import { isLivePage } from "../utils/page";
import { createReactElement, waitingElement } from "../utils/dom";

import {
  VIDEO_BUTTONS,
  PLAYER_LAYOUT_ID,
  // LIVE_INFORMATION_HEAD,
  CHATTING_TOOLS,
  WEBPLAYER_VIDEO,
  VIDEO_VIEW_BTN,
  CHATTING_ACTIONS,
  SECTION_TOOLBAR,
} from "../constants/class";
import {
  FAST_BUTTON,
  AUDIO_COMPRESSOR,
  ONLIVE_REFRESH,
  PIP_BUTTON,
  AUTO_WIDE_MODE,
  GUARD_ENALBE,
} from "../constants/storage";
import MessageStorageButton from "../components/button/MessageStorageButton/MessageStorageButton";
import { traceOpenLive } from "../utils/trace";
import PipButton from "../components/button/PipButton/PipButton";
import ScreenGuardButton from "../components/button/ScreenGuardButton/ScreenGuardButton";

export const editLivePage = async () => {
  if (!isLivePage()) return;

  // Live 페이지 인데, 생방송 중이 아님.
  const webPlayerVideo = await waitingElement(WEBPLAYER_VIDEO);
  if (!webPlayerVideo) {
    chrome.storage.local.get([ONLIVE_REFRESH], (res) => {
      if (res[ONLIVE_REFRESH]) {
        traceOpenLive();
      }
    });

    return;
  }

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(PLAYER_LAYOUT_ID);
  if (!$playerLayout) {
    return;
  }

  // if (!document.getElementById("chzzk-plus-live-helper")) {
  // Feat: Helper 추가 (즐겨찾기, 녹화, 캡처) =========================================================
  // const $infoHeads = document.getElementsByClassName(LIVE_INFORMATION_HEAD);
  // if ($infoHeads.length > 0) {
  //   const $liveTitle = $infoHeads[0] as HTMLElement;
  //   $liveTitle.style.justifyContent = "space-between";
  //   const $liveHelper = document.createElement("div");
  //   $liveHelper.id = "chzzk-plus-live-helper";
  //   $liveTitle.appendChild($liveHelper);
  //   createReactElement($liveHelper, LiveHelper);
  // }
  // }
  const $chatToolsList = await waitingElement(CHATTING_TOOLS);
  if (!$chatToolsList) return;

  if (!document.getElementById("chzzk-plus-live-chattools")) {
    const $donationTools = $chatToolsList.querySelector(CHATTING_ACTIONS);
    if ($donationTools) {
      const $tools = document.createElement("div");
      $tools.id = "chzzk-plus-live-chattools";
      $tools.style.display = "inline-flex";
      $tools.style.width = "28px";
      $tools.style.height = "28px";
      $donationTools?.append($tools);
      createReactElement($tools, MessageStorageButton);
    }
  }

  /*
    치지직내 PIP 기능 추가되어 제거함
    // // Feat: PIP 버튼 활성화 =========================================================
    // const $pipButtonRoot = document.createElement("div");
    // $pipButtonRoot.id = "chzzk-plus-live-btns";
    // $btn_list?.prepend($pipButtonRoot);
    // createReactElement($pipButtonRoot, PipButton);
  */
  chrome.storage.local.get(
    [FAST_BUTTON, AUDIO_COMPRESSOR, PIP_BUTTON, AUTO_WIDE_MODE, GUARD_ENALBE],
    (res) => {
      const $btn_list = document.querySelector(VIDEO_BUTTONS);

      // Feat: 빨리감기 버튼 활성화 =========================================================
      if (
        res[FAST_BUTTON] &&
        $btn_list &&
        !document.getElementById("chzzk-plus-fast-btns")
      ) {
        const $FastButton = document.createElement("div");
        $FastButton.id = "chzzk-plus-fast-btns";
        $btn_list?.prepend($FastButton);
        createReactElement($FastButton, FastButton);
      }
      // Feat: PIP 키 이벤트 활성화 =========================================================
      if (
        res[PIP_BUTTON] &&
        $btn_list &&
        !document.getElementById("chzzk-plus-pip-btn")
      ) {
        const $PipButton = document.createElement("div");
        $PipButton.id = "chzzk-plus-pip-btn";
        $btn_list?.prepend($PipButton);
        createReactElement($PipButton, PipButton);
      }
      // Feat: 오디오 압축 버튼 활성화 =======================================================
      if (
        res[AUDIO_COMPRESSOR] &&
        $btn_list &&
        !document.getElementById("chzzk-plus-compr-btns")
      ) {
        const $AudioCompressorButton = document.createElement("div");
        $AudioCompressorButton.id = "chzzk-plus-compr-btns";
        $btn_list?.prepend($AudioCompressorButton);
        createReactElement($AudioCompressorButton, AudioCompressorButton);
      }
      // Feat: 녹화, 캡처 활성화 ============================================================
      // if (
      //   res[RECORD_ENABLE] &&
      //   $btn_list &&
      //   !document.getElementById("chzzk-plus-capture-btns")
      // ) {
      //   const $CaptureButton = document.createElement("div");
      //   $CaptureButton.id = "chzzk-plus-capture-btns";
      //   $btn_list?.prepend($CaptureButton);
      //   createReactElement($CaptureButton, CaptureButton);
      //   const $RecordButton = document.createElement("div");
      //   $RecordButton.id = "chzzk-plus-record-btns";
      //   $btn_list?.prepend($RecordButton);
      //   createReactElement($RecordButton, RecordButton);
      // }
      // Feat: 자동 넓은 화면 활성화 =========================================================
      if (res[AUTO_WIDE_MODE]) {
        const wideScreenButton = document.querySelector(VIDEO_VIEW_BTN);
        if (wideScreenButton) {
          (wideScreenButton as HTMLButtonElement).click();
        }
      }
      if (res[GUARD_ENALBE]) {
        const $sectionToolbar = document.querySelector(SECTION_TOOLBAR);
        if (
          $sectionToolbar &&
          !document.getElementById("chzzk-plus-screen-guard")
        ) {
          const $tools = document.createElement("div");
          $tools.id = "chzzk-plus-screen-guard";
          $sectionToolbar?.prepend($tools);
          createReactElement($tools, ScreenGuardButton);
        }
      }
    }
  );

  log("LIVE PAGE 설정");
};
