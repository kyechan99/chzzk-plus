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
  CHAT_INPUT_EDITABLE,
  CHAT_EMOJI_AREA,
  ASIDE_POPUP_CONTENTS,
  CHAT_EMOJI_SEARCH_ROOT_CLASS,
} from '../constants/class';
import { CHAT_EMOJI_SEARCH_ENABLE, CHAT_EMOJI_TAG_MODAL } from '../constants/storage';
import { createReactElement, dispatchMouseClickSequence } from '../utils/dom';
import ChatEmojiSearch from '../components/ChatEmojiSearch/ChatEmojiSearch';
import { getChatContainer, getChatInputEditable } from '../utils/chatDom';

const MARKER_CLASS = CHAT_EMOJI_SEARCH_ROOT_CLASS;

let enabled = false;

// 이모티콘 팝업을 닫는다 — 팝업을 연 토글 버튼(aria-expanded)을 다시 눌러 치지직 자체 닫기 경로를 재사용.
// 토글 버튼은 해시 클래스뿐이라, 네이버 a11y 클래스(.blind)의 텍스트 "이모티콘" 으로 특정한다.
const closeEmojiPopup = (): void => {
  const $toggles = document.querySelectorAll<HTMLButtonElement>(`${CHAT_CONTAINER} button[aria-expanded="true"]`);
  const $emojiToggle = [...$toggles].find($btn => {
    const text = $btn.textContent ?? '';
    const label = $btn.getAttribute('aria-label') ?? '';
    return text.includes('이모티콘') || label.includes('이모티콘');
  });

  $emojiToggle?.click();
};

// contenteditable 요소의 캐럿을 내용 맨 끝으로 이동시킨다. (포커스 직후 기본 위치는 맨 앞)
const moveCaretToEnd = ($el: HTMLElement): void => {
  const range = document.createRange();
  range.selectNodeContents($el);
  range.collapse(false); // false = 끝으로 접기

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

// 채팅 입력창(contenteditable pre)에 포커스를 준다.
// CHAT_INPUT(_default_ 클래스 요구)은 입력창에 내용이 있으면 매칭되지 않으므로 CHAT_INPUT_EDITABLE 을 사용.
//
// 팝업이 닫힐 때 치지직이 입력 영역을 리렌더하면서 포커스했던 노드가 교체될 수 있으므로,
// 리렌더가 가라앉을 때까지 재조회 + 재시도한다 (50ms × 10회).
const focusChatInput = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) {
    const $input = getChatInputEditable() ?? document.querySelector<HTMLElement>(CHAT_INPUT_EDITABLE);

    if ($input) {
      $input.focus();
      if (document.activeElement === $input) {
        moveCaretToEnd($input);
        return;
      }

      // focus() 가 무시되는 상태면 실제 클릭과 동일한 시퀀스로 치지직 포커스 로직을 태운다
      dispatchMouseClickSequence($input, true);
      if (document.activeElement === $input) {
        moveCaretToEnd($input);
        return;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

// Esc 우선순위 체인 (포커스 위치 무관):
// 1) 태그 모달이 열려 있으면 모달만 닫는다 (이모티콘 팝업은 유지)
// 2) 이모티콘 팝업이 열려 있으면 팝업을 닫는다
// 처리한 경우 이벤트를 소비해 치지직 자체 Esc 핸들러(전체화면 해제 등)까지 내려가지 않게 한다.
// capture 단계라 다른 핸들러의 stopPropagation 에 막히지 않고, 같은 함수 참조로 add/remove 하므로 중복 등록되지 않는다.
const onDocumentKeyDown = (e: KeyboardEvent): void => {
  if (e.key !== 'Escape') return;

  const consume = () => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (document.querySelector('.czp-emoji-tag-modal')) {
    consume();
    chrome.storage.local.set({ [CHAT_EMOJI_TAG_MODAL]: false });
    return;
  }

  if (document.querySelector(CHAT_EMOJI_AREA)) {
    consume();
    closeEmojiPopup();
  }
};

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
let popupWasOpen = false;

// 영속 앵커에 상주 — 팝업의 등장 자체를 감지
const startObserver = () => {
  const $aside = getChatContainer();
  if (!$aside) return;

  // 살아있는 옵저버가 있으면 유지, 죽었으면(관찰 대상이 DOM 재구성으로 제거) 정리 후 재부착
  if (rootObserver && $observedTarget && document.contains($observedTarget)) return;
  stopObserver();

  $observedTarget = $aside;
  rootObserver = new MutationObserver(() => {
    const $container = findChatEmojiPopUpContainer();

    if ($container) {
      const $area = $container.$area;

      if (!$area.querySelector(`.${MARKER_CLASS}`)) {
        $container.$container.classList.add('czp-emoji-search-popup-expanded');

        const $root = document.createElement('div');
        $root.className = MARKER_CLASS;

        $area.prepend($root);
        createReactElement($root, ChatEmojiSearch);
      }
    }

    // 팝업 열림 → 닫힘 전이 감지 시 채팅 입력창으로 포커스 복귀
    // (열림 시 검색창 포커스는 컴포넌트 마운트 effect 가 담당)
    const isOpen = !!document.querySelector(CHAT_EMOJI_AREA);
    if (popupWasOpen && !isOpen) {
      focusChatInput();
    }
    popupWasOpen = isOpen;
  });
  rootObserver.observe($aside, { childList: true, subtree: true });
  document.addEventListener('keydown', onDocumentKeyDown, true);
};

const stopObserver = (): void => {
  rootObserver?.disconnect();
  rootObserver = null;
  $observedTarget = null;
  popupWasOpen = false;
  document.removeEventListener('keydown', onDocumentKeyDown, true);
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
