/**
 * 채팅 이모티콘 검색.
 *
 * 이모티콘 팝업(#emoji_area)이 열리면 상단에 검색 UI 를 주입한다.
 * 치지직 React 가 소유한 노드는 읽기만 하고, UI 는 우리가 만든 루트 div 안에서만 렌더링한다.
 * 이모티콘 데이터는 emoji-packs API 로 인덱싱하고, 선택 시 네이티브 이모티콘 버튼 클릭을 재사용해 삽입한다.
 * (다른 팩의 이모티콘은 팩 탭을 mousedown 디스패치로 전환한 뒤 클릭)
 *
 * 팝업은 열고 닫힐 때마다 DOM 에서 생성/제거되므로, 영속 앵커(채팅 하단 영역)에
 * MutationObserver 를 상주시켜 팝업 등장을 감지하고 매번 재주입한다(idempotent).
 */
import { isLivePage } from '../utils/page';
import {
  CHAT_CONTAINER,
  CHAT_USER_AREA,
  CHAT_EMOJI_AREA,
  ASIDE_POPUP_CONTENTS,
  CHAT_EMOJI_SEARCH_ROOT_CLASS,
} from '../constants/class';
import { CHAT_EMOJI_SEARCH_ENABLE } from '../constants/storage';
import { createReactElement } from '../utils/dom';
import ChatEmojiSearch from '../components/ChatEmojiSearch/ChatEmojiSearch';

const MARKER_CLASS = CHAT_EMOJI_SEARCH_ROOT_CLASS;

let enabled = false;

// === 채팅 이모티콘 팝업 컨테이너 ===
// CHAT_EMOJI_AREA 와 ASIDE_POPUP_CONTENTS 가 존재하면, 이모티콘 컨테이너가 존재하는 것으로 간주한다.
type ChatEmojiPopUpContainer = {
  $container: HTMLElement;
  $contents: HTMLElement;
  $area: HTMLElement;
};

const findChatEmojiPopUpContainer = (): ChatEmojiPopUpContainer | null => {
  if (!enabled || !isLivePage()) return null;

  const $area = document.querySelector<HTMLElement>(CHAT_EMOJI_AREA);
  if (!$area) return null;

  const $contents = $area.closest<HTMLElement>(ASIDE_POPUP_CONTENTS);
  if (!$contents) return null;

  const $container = $contents.closest<HTMLElement>('[role="alertdialog"][aria-modal="true"]');
  if (!$container) return null;

  return { $container, $contents, $area };
};
// === 채팅 이모티콘 팝업 컨테이너 END ===

// === 옵저버 ===
let rootObserver: MutationObserver | null = null;
let $observedTarget: Element | null = null;

// 영속 앵커에 상주 — 팝업의 등장 자체를 감지
const startObserver = () => {
  const $aside = document.querySelector(CHAT_CONTAINER);
  if (!$aside) return;

  const $chatUserArea = $aside.querySelector(CHAT_USER_AREA);
  if (!$chatUserArea) return;

  // 살아있는 옵저버가 있으면 유지, 죽었으면(관찰 대상이 DOM 재구성으로 제거) 정리 후 재부착
  if (rootObserver && $observedTarget && document.contains($observedTarget)) return;
  stopObserver();

  $observedTarget = $chatUserArea;
  rootObserver = new MutationObserver(() => {
    const $container = findChatEmojiPopUpContainer();

    if ($container) {
      const $area = $container.$area;

      if (!$area.querySelector(`.${MARKER_CLASS}`)) {
        const $root = document.createElement('div');
        $root.className = MARKER_CLASS;

        $area.prepend($root);
        createReactElement($root, ChatEmojiSearch);
      }
    }
  });
  rootObserver.observe($chatUserArea, { childList: true, subtree: true });
};

const stopObserver = (): void => {
  rootObserver?.disconnect();
  rootObserver = null;
  $observedTarget = null;
  document.querySelectorAll(`.${MARKER_CLASS}`).forEach(el => el.remove());
};
// === 옵저버 END ===

// === exported ===
// 라이브 페이지 진입/재구성 시 호출 (채팅 컨테이너가 새로 생기면 재관찰).
export const chatEmojiSearchSetting = (): void => {
  if (enabled) startObserver();
};

// 채팅 이모티콘 검색 기능 초기화
export const initChatEmojiSearch = (): void => {
  // 초기 활성화 여부 확인
  chrome.storage.local.get(CHAT_EMOJI_SEARCH_ENABLE, res => {
    enabled = res[CHAT_EMOJI_SEARCH_ENABLE] ?? false;
    if (enabled) startObserver();
  });

  // 이모티콘 검색 피쳐 활성화/비활성화 대응
  chrome.storage.onChanged.addListener(changes => {
    const change = changes[CHAT_EMOJI_SEARCH_ENABLE];
    if (!change) return;

    enabled = change.newValue ?? false;
    if (enabled) {
      startObserver();
    } else {
      stopObserver();
    }
  });
};
// === exported ===
