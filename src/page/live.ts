// import Barricade from "../components/video/Barricade/Barricade";
import FastButton from '../components/button/FastButton/FastButton';
import AudioCompressorButton from '../components/button/AudioCompressorButton/AudioCompressorButton';

import { log } from '../utils/log';
import { isLivePage } from '../utils/page';
import { createReactElement, waitingElement } from '../utils/dom';
import { findHeaderToolbar } from '../utils/header';

import {
  WEBPLAYER_VIDEO,
  CHATTING_DONATION_POPUP,
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
import { findPlayerButtonList } from '../utils/playerDom';
import { getChatActionArea, getChatContainer } from '../utils/chatDom';

const FAVORITE_ROOT_ID = 'chzzk-plus-favorite-btn';
type ReactComponent = () => JSX.Element;

let donationPopupObserver: MutationObserver | null = null;
let donationPopupObserverTarget: Element | null = null;

const mountReactRoot = (
  parent: Element | null,
  id: string,
  Component: ReactComponent,
  place: 'prepend' | 'append' = 'prepend',
): Element | null => {
  if (!parent) return null;

  const existing = document.getElementById(id);
  if (existing && parent.contains(existing)) return existing;
  existing?.remove();

  const root = document.createElement('div');
  root.id = id;
  parent[place](root);
  createReactElement(root, Component);
  return root;
};

const getButtonText = (button: HTMLButtonElement): string => {
  return [
    button.textContent,
    button.getAttribute('aria-label'),
    button.getAttribute('title'),
    button.getAttribute('data-tooltip'),
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const findLiveControlMenu = (): Element | null => {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
  const semanticButton = buttons.find(button => {
    const text = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const label = button.getAttribute('aria-label') ?? '';
    return text.includes('구독') || text.includes('팔로우') || label.includes('구독') || label.includes('팔로우');
  });
  if (semanticButton?.parentElement) return semanticButton.parentElement;

  return (
    Array.from(document.querySelectorAll<HTMLElement>('main div, main section')).find(element => {
      const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return element.querySelectorAll('button').length >= 2 && (text.includes('구독') || text.includes('팔로우'));
    }) ?? null
  );
};

const findFollowButton = (): HTMLButtonElement | null => {
  return (
    Array.from(document.querySelectorAll<HTMLButtonElement>('main button')).find(button => {
      const text = getButtonText(button);
      return text.includes('팔로우') || text.includes('팔로잉') || /\bFollow(?:ing)?\b/i.test(text);
    }) ?? null
  );
};

const findFavoriteMountTarget = (): Element | null => {
  return findFollowButton()?.parentElement ?? findLiveControlMenu();
};

const findFollowStateScope = (mountTarget: Element): Element => {
  return mountTarget.closest('section, article, [class*="_profile_"], [class*="_information_"]') ?? mountTarget;
};

const isFollowingChannel = (mountTarget: Element): boolean => {
  const scope = findFollowStateScope(mountTarget);
  const buttons = Array.from(scope.querySelectorAll<HTMLButtonElement>('button'));

  return buttons.some(button => {
    const text = getButtonText(button);
    return text.includes('팔로잉') || /\bFollowing\b/i.test(text);
  });
};

const removeFavoriteButton = (): void => {
  document.getElementById(FAVORITE_ROOT_ID)?.remove();
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
    [FAST_BUTTON, AUDIO_COMPRESSOR, PIP_BUTTON, AUTO_WIDE_MODE, GUARD_ENALBE, CHAT_STORAGE_ENABLE, FAVORITE_ENABLE],
    res => {
      if (res[CHAT_STORAGE_ENABLE]) {
        ensureMessageStorageButton();
        observeDonationPopupRemoval();
      }

      // Feat: 즐겨찾기 버튼 (라이브 정보 헤더 옆) ==============================================
      if (res[FAVORITE_ENABLE]) {
        const $followControl = findFavoriteMountTarget();
        if (!$followControl || !isFollowingChannel($followControl)) {
          removeFavoriteButton();
        } else {
          mountReactRoot($followControl, FAVORITE_ROOT_ID, FavoriteButton);
          ($followControl as HTMLElement).style.display = 'flex';
          ($followControl as HTMLElement).style.gap = '6px';
        }
      } else {
        removeFavoriteButton();
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
