// import Barricade from "../components/video/Barricade/Barricade";
import FastButton from '../components/button/FastButton/FastButton';
import AudioCompressorButton from '../components/button/AudioCompressorButton/AudioCompressorButton';

import { log } from '../utils/log';
import { isLivePage } from '../utils/page';
import { waitingElement } from '../utils/dom';
import { findHeaderToolbar } from '../utils/header';

import { WEBPLAYER_VIDEO, CHATTING_DONATION_POPUP, CHATTING_AREA } from '../constants/class';
import {
  FAST_BUTTON,
  AUDIO_COMPRESSOR,
  ONLIVE_REFRESH,
  PIP_BUTTON,
  AUTO_WIDE_MODE,
  GUARD_ENALBE,
  CHAT_STORAGE_ENABLE,
} from '../constants/storage';
import MessageStorageButton from '../components/button/MessageStorageButton/MessageStorageButton';
import { traceOpenLive } from '../utils/trace';
import { bufferDisplaySetting } from '../feature/bufferDisplay';
import { chatTimestampSetting } from '../feature/chatTimestamp';
import { chatEmojiSearchSetting } from '../feature/chatEmojiSearch';
import PipButton from '../components/button/PipButton/PipButton';
import ScreenGuardButton from '../components/button/ScreenGuardButton/ScreenGuardButton';
import { findPlayerButtonList } from '../utils/playerDom';
import { getChatActionArea, getChatContainer } from '../utils/chatDom';
import { mountReactRoot } from '../utils/favoriteButton';

let donationPopupObserver: MutationObserver | null = null;
let donationPopupObserverTarget: Element | null = null;

export const editLivePage = async () => {
  if (!isLivePage()) return;

  // Live 페이지 인데, 생방송 중이 아님.
  const webPlayerVideo = await waitingElement(WEBPLAYER_VIDEO);
  if (!webPlayerVideo) {
    chrome.storage.local.get([ONLIVE_REFRESH], res => {
      if (res[ONLIVE_REFRESH]) {
        traceOpenLive();
      }
    });

    return;
  }
  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
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

  // 비디오 지연(버퍼) 시간 표시 (활성화 시 채팅 입력창 placeholder 에 표기)
  bufferDisplaySetting();
  // 채팅 타임스탬프 (채팅 재구성 시 재관찰)
  chatTimestampSetting();
  chatEmojiSearchSetting();

  const ensureMessageStorageButton = () => {
    const $donationTools = getChatActionArea();
    const $tools = mountReactRoot($donationTools, 'chzzk-plus-live-chattools', MessageStorageButton, 'append');
    if (!$tools) return;

    ($tools as HTMLElement).style.display = 'inline-flex';
    ($tools as HTMLElement).style.width = '28px';
    ($tools as HTMLElement).style.height = '28px';
  };

  // CHATTING_DONATION_POPUP 엘리먼트가 제거될 때 MessageStorageButton 버튼을 재생성
  const observeDonationPopupRemoval = () => {
    const $chat_area = getChatContainer() ?? document.querySelector(CHATTING_AREA);
    if (!$chat_area || donationPopupObserverTarget === $chat_area) return;

    donationPopupObserver?.disconnect();
    donationPopupObserverTarget = $chat_area;
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        mutation.removedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(CHATTING_DONATION_POPUP) || node.querySelector?.(CHATTING_DONATION_POPUP)) {
            // 약간의 지연 후 재시도 (DOM 재구성이 끝난 뒤)
            setTimeout(() => {
              ensureMessageStorageButton();
            }, 0);
          }
        });
      }
    });
    observer.observe($chat_area, { childList: true, subtree: true });
    donationPopupObserver = observer;
  };

  /*
    치지직내 PIP 기능 추가되어 제거함
    // // Feat: PIP 버튼 활성화 =========================================================
    // const $pipButtonRoot = document.createElement("div");
    // $pipButtonRoot.id = "chzzk-plus-live-btns";
    // $btn_list?.prepend($pipButtonRoot);
    // createReactElement($pipButtonRoot, PipButton);
  */
  chrome.storage.local.get(
    [FAST_BUTTON, AUDIO_COMPRESSOR, PIP_BUTTON, AUTO_WIDE_MODE, GUARD_ENALBE, CHAT_STORAGE_ENABLE],
    res => {
      if (res[CHAT_STORAGE_ENABLE]) {
        ensureMessageStorageButton();
        observeDonationPopupRemoval();
      }

      const $btn_list = findPlayerButtonList();

      // Feat: 빨리감기 버튼 활성화 =========================================================
      if (res[FAST_BUTTON] && $btn_list) {
        mountReactRoot($btn_list, 'chzzk-plus-fast-btns', FastButton);
      }
      // Feat: PIP 키 이벤트 활성화 =========================================================
      if (res[PIP_BUTTON] && $btn_list) {
        mountReactRoot($btn_list, 'chzzk-plus-pip-btn', PipButton);
      }
      // Feat: 오디오 압축 버튼 활성화 =======================================================
      if (res[AUDIO_COMPRESSOR] && $btn_list) {
        mountReactRoot($btn_list, 'chzzk-plus-compr-btns', AudioCompressorButton);
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
      // 임시 비활성화 (설정에서도 disabled 처리)
      // if (res[AUTO_WIDE_MODE]) {
      //   const wideScreenButton = document.querySelector(VIDEO_VIEW_BTN);
      //   if (wideScreenButton) {
      //     (wideScreenButton as HTMLButtonElement).click();
      //   }
      // }
      if (res[GUARD_ENALBE]) {
        const $sectionToolbar = findHeaderToolbar();
        mountReactRoot($sectionToolbar, 'chzzk-plus-screen-guard', ScreenGuardButton);
      }
    },
  );

  log('LIVE PAGE 설정');
};
