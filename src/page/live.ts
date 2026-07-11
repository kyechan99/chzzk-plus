// import Barricade from "../components/video/Barricade/Barricade";
import FastButton from '../components/button/FastButton/FastButton';
import AudioCompressorButton from '../components/button/AudioCompressorButton/AudioCompressorButton';

import { log } from '../utils/log';
import { isLivePage } from '../utils/page';
import { createReactElement, findClosestByClassPrefixWithChildTexts, waitingElement } from '../utils/dom';

import {
  VIDEO_BUTTONS,
  PLAYER_LAYOUT_ID,
  CHATTING_TOOLS,
  WEBPLAYER_VIDEO,
  CHATTING_ACTIONS,
  CHATTING_DONATION_POPUP,
  SECTION_TOOLBAR,
  CHATTING_AREA,
} from '../constants/class';
import {
  FAST_BUTTON,
  AUDIO_COMPRESSOR,
  ONLIVE_REFRESH,
  PIP_BUTTON,
  AUTO_WIDE_MODE,
  GUARD_ENALBE,
  CHAT_STORAGE_ENABLE,
  FAVORITE_ENABLE,
} from '../constants/storage';
import MessageStorageButton from '../components/button/MessageStorageButton/MessageStorageButton';
import { traceOpenLive } from '../utils/trace';
import { bufferDisplaySetting } from '../feature/bufferDisplay';
import { chatTimestampSetting } from '../feature/chatTimestamp';
import { chatEmojiSearchSetting } from '../feature/chatEmojiSearch';
import PipButton from '../components/button/PipButton/PipButton';
import ScreenGuardButton from '../components/button/ScreenGuardButton/ScreenGuardButton';
import FavoriteButton from '../components/button/FavoriteButton/FavoriteButton';

const LIVE_CONTROL_MENU_CLASS_PREFIX = '_control_';
const LIVE_CONTROL_MENU_BUTTON_LABELS = ['팔로잉', '구독 선물'];

const findLiveControlMenu = (): Element | null => {
  return findClosestByClassPrefixWithChildTexts({
    childSelector: 'button',
    classPrefix: LIVE_CONTROL_MENU_CLASS_PREFIX,
    texts: LIVE_CONTROL_MENU_BUTTON_LABELS,
  });
};

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

  // 비디오 지연(버퍼) 시간 표시 (활성화 시 채팅 입력창 placeholder 에 표기)
  bufferDisplaySetting();
  // 채팅 타임스탬프 (채팅 재구성 시 재관찰)
  chatTimestampSetting();
  chatEmojiSearchSetting();

  const $chatToolsList = await waitingElement(CHATTING_TOOLS);
  if (!$chatToolsList) return;

  const ensureMessageStorageButton = () => {
    if (!document.getElementById('chzzk-plus-live-chattools')) {
      const $chatTools = document.querySelector(CHATTING_TOOLS);
      const $donationTools = $chatTools?.querySelector(CHATTING_ACTIONS);
      if ($donationTools) {
        const $tools = document.createElement('div');
        $tools.id = 'chzzk-plus-live-chattools';
        $tools.style.display = 'inline-flex';
        $tools.style.width = '28px';
        $tools.style.height = '28px';
        $donationTools.append($tools);
        createReactElement($tools, MessageStorageButton);
      }
    }
  };

  // CHATTING_DONATION_POPUP 엘리먼트가 제거될 때 MessageStorageButton 버튼을 재생성
  const observeDonationPopupRemoval = () => {
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
    const $chat_area = document.querySelector(CHATTING_AREA);
    if ($chat_area) observer.observe($chat_area, { childList: true, subtree: true });
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
    [FAST_BUTTON, AUDIO_COMPRESSOR, PIP_BUTTON, AUTO_WIDE_MODE, GUARD_ENALBE, CHAT_STORAGE_ENABLE, FAVORITE_ENABLE],
    res => {
      if (res[CHAT_STORAGE_ENABLE]) {
        ensureMessageStorageButton();
        observeDonationPopupRemoval();
      }

      // Feat: 즐겨찾기 버튼 (라이브 정보 헤더 옆) ==============================================
      if (res[FAVORITE_ENABLE] && !document.getElementById('chzzk-plus-favorite-btn')) {
        const $liveControl = findLiveControlMenu();
        if ($liveControl) {
          const $favRoot = document.createElement('div');
          $favRoot.id = 'chzzk-plus-favorite-btn';
          $liveControl.prepend($favRoot);
          createReactElement($favRoot, FavoriteButton);
        }
      }

      const $btn_list = document.querySelector(VIDEO_BUTTONS);

      // Feat: 빨리감기 버튼 활성화 =========================================================
      if (res[FAST_BUTTON] && $btn_list && !document.getElementById('chzzk-plus-fast-btns')) {
        const $FastButton = document.createElement('div');
        $FastButton.id = 'chzzk-plus-fast-btns';
        $btn_list?.prepend($FastButton);
        createReactElement($FastButton, FastButton);
      }
      // Feat: PIP 키 이벤트 활성화 =========================================================
      if (res[PIP_BUTTON] && $btn_list && !document.getElementById('chzzk-plus-pip-btn')) {
        const $PipButton = document.createElement('div');
        $PipButton.id = 'chzzk-plus-pip-btn';
        $btn_list?.prepend($PipButton);
        createReactElement($PipButton, PipButton);
      }
      // Feat: 오디오 압축 버튼 활성화 =======================================================
      if (res[AUDIO_COMPRESSOR] && $btn_list && !document.getElementById('chzzk-plus-compr-btns')) {
        const $AudioCompressorButton = document.createElement('div');
        $AudioCompressorButton.id = 'chzzk-plus-compr-btns';
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
      // 임시 비활성화 (설정에서도 disabled 처리)
      // if (res[AUTO_WIDE_MODE]) {
      //   const wideScreenButton = document.querySelector(VIDEO_VIEW_BTN);
      //   if (wideScreenButton) {
      //     (wideScreenButton as HTMLButtonElement).click();
      //   }
      // }
      if (res[GUARD_ENALBE]) {
        const $sectionToolbar = document.querySelector(SECTION_TOOLBAR);
        if ($sectionToolbar && !document.getElementById('chzzk-plus-screen-guard')) {
          const $tools = document.createElement('div');
          $tools.id = 'chzzk-plus-screen-guard';
          $sectionToolbar?.prepend($tools);
          createReactElement($tools, ScreenGuardButton);
        }
      }
    },
  );

  log('LIVE PAGE 설정');
};
