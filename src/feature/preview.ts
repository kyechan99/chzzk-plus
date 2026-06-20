import Preview from '../components/video/Preview/Preview';

import { createReactElement, waitingElement } from '../utils/dom';

import { CHAT_NAME_COLOR, CHAT_TEXT_COLOR, FOLLOWING_REFRESH_ENABLE, PREVIEW_ENABLE } from '../constants/storage';
import { CHAT_NAME_COLOR_DEFAULT, CHAT_TEXT_COLOR_DEFAULT } from '../constants/color';
import { REFRESH_BUTTON, SIDEBAR, SIDEBAR_MENU, STREAMER_MORE_BTN } from '../constants/class';

let refresher: number | undefined;
let refresherInitialized = false;

// 이미 '더보기' 를 눌러 펼친 버튼들. 버튼 엘리먼트 단위로 추적하므로, 사이드바가 리빌드되어
// 새 버튼이 생기면(다른 엘리먼트) 다시 한 번 펼친다. (토글 깜빡임 방지 + rebuild 자가복구)
const expandedMoreButtons = new WeakSet<Element>();

/**
 * 팔로잉 목록의 '더보기' 자동 펼침.
 * preview div 생성 여부와 무관하게 매번 호출되어, 사이드바가 다시 그려져 목록이 접히면
 * 새 '더보기' 버튼을 한 번 눌러 다시 펼친다.
 */
const autoExpandFollowing = ($sidebar: HTMLElement): void => {
  const $sidebarMenus = $sidebar.querySelectorAll(SIDEBAR_MENU);
  if ($sidebarMenus.length <= 1) return;

  const $followingSidebarMenu = $sidebarMenus[1];
  const moreChannelBtn = $followingSidebarMenu?.querySelector(STREAMER_MORE_BTN) as HTMLButtonElement | null;
  if (!moreChannelBtn || expandedMoreButtons.has(moreChannelBtn)) return;

  expandedMoreButtons.add(moreChannelBtn);
  moreChannelBtn.click();
};

/** 팔로잉 자동 새로고침 타이머 (한 번만 설정). */
const setupFollowingRefresher = (): void => {
  if (refresherInitialized) return;

  chrome.storage.local.get(FOLLOWING_REFRESH_ENABLE, res => {
    if (!res[FOLLOWING_REFRESH_ENABLE]) return;
    refresherInitialized = true;
    clearInterval(refresher);
    refresher = setInterval(() => {
      // REFRESH_BUTTON 은 총 4개지만, 첫번째가 새로고침 버튼임
      // (버튼이 사라진 순간 클릭하면 throw 되어 interval 이 깨지므로 null 가드)
      const $refreshBtn = document.querySelector(REFRESH_BUTTON) as HTMLElement | null;
      $refreshBtn?.click();
    }, 1000 * 10);
  });
};

export async function previewSetting(): Promise<void> {
  const $sidebar = await waitingElement(SIDEBAR);
  if (!$sidebar) return;

  // 사이드바 리빌드에도 매번 자가복구되어야 하는 기능들 (가드 밖)
  autoExpandFollowing($sidebar);
  setupFollowingRefresher();

  // Feat: Preview 썸네일 (Preview 컴포넌트는 #sidebar 이벤트 위임이라 리빌드에 견딘다) =========
  if (!document.getElementById('chzzk-plus-preview')) {
    const $preview = document.createElement('div');
    $preview.id = 'chzzk-plus-preview';
    $sidebar.appendChild($preview);

    chrome.storage.local.get(PREVIEW_ENABLE, res => {
      if (res[PREVIEW_ENABLE]) createReactElement($preview, Preview);
    });

    // 색상 기본값 보존: CSS 변수 적용/갱신은 earlyStyle.ts(document_start)가 담당.
    // 여기서는 저장된 값이 없을 때만 기본값을 storage 에 1회 보존(설정 UI 표시용).
    chrome.storage.local.get([CHAT_NAME_COLOR, CHAT_TEXT_COLOR], res => {
      if (!res[CHAT_NAME_COLOR]) chrome.storage.local.set({ [CHAT_NAME_COLOR]: CHAT_NAME_COLOR_DEFAULT });
      if (!res[CHAT_TEXT_COLOR]) chrome.storage.local.set({ [CHAT_TEXT_COLOR]: CHAT_TEXT_COLOR_DEFAULT });
    });
  }
}
