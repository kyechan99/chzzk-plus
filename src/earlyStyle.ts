/**
 * document_start 에 실행되는 콘텐츠 스크립트.
 *
 * 채팅 숨김/크기/색상처럼 "순수 CSS" 로 끝나는 기능은 대상 엘리먼트를 기다릴 필요가 없다.
 * 채팅이 그려지기 전에 <style> 규칙을 미리 꽂아두면, 엘리먼트가 렌더되는 즉시 적용되어
 * 깜빡임(주입 전 잠깐 보였다 사라지는 현상)이 사라진다.
 *
 * 기존에는 feature/chat.ts 에서 waitingElement 로 채팅 컨테이너를 기다린 뒤 <style> 을
 * 추가했기 때문에 (1) 한 박자 늦게 적용되고 (2) 라우팅마다 <style> 이 중복 누적됐다.
 * 여기서는 단일 <style id="czp-early-chat-style"> 을 관리하고 storage 변경 시 갱신한다.
 */
import {
  BLIND_CHAT,
  CHAT_CONTENT,
  CHAT_ITEM,
  CHAT_NAME,
  CHAT_CONTAINER,
  DATA_CHAT_ITEM,
  DATA_CHAT_NICK,
  CHEEZE_CHAT,
  SUBSCRIBE_CHAT,
  CHEEZE_RANKING_CHAT,
  CHATTING_BADGE,
} from './constants/class';
import {
  BLIND_REMOVER,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_TEXT_COLOR,
  CHEEZE_RANKING_REMOVER,
  CHEEZE_REMOVER,
  SUBSCRIBE_REMOVER,
  CHAT_BADGE_REMOVER,
  COLOR_PROPERTIES,
} from './constants/storage';
import { CHAT_NAME_COLOR_DEFAULT, CHAT_TEXT_COLOR_DEFAULT } from './constants/color';

const STYLE_ID = 'czp-early-chat-style';
const CHAT_ITEM_STABLE_SELECTOR = `${CHAT_CONTAINER} [${DATA_CHAT_ITEM}], ${CHAT_CONTAINER} [class*="live_chatting_list_item__"]`;
const CHAT_TEXT_STABLE_SELECTOR = [
  `${CHAT_CONTAINER} [${DATA_CHAT_ITEM}] [${DATA_CHAT_NICK}]`,
  `${CHAT_CONTAINER} [${DATA_CHAT_ITEM}] [class*="_nickname_"]`,
  `${CHAT_CONTAINER} [${DATA_CHAT_ITEM}] [class*="live_chatting_message_nickname__"]`,
  `${CHAT_CONTAINER} [${DATA_CHAT_ITEM}] [class*="_text_"]`,
  `${CHAT_CONTAINER} [class*="live_chatting_list_item__"] [class*="live_chatting_message_nickname__"]`,
  `${CHAT_CONTAINER} [class*="live_chatting_list_item__"] [class*="live_chatting_message_text__"]`,
  `${CHAT_CONTAINER} [class*="live_chatting_list_item__"] [class*="_nickname_"]`,
  `${CHAT_CONTAINER} [class*="live_chatting_list_item__"] [class*="_text_"]`,
].join(', ');
// CSS 빌드에 영향을 주는 storage 키들 (이 중 하나라도 바뀌면 <style> 재빌드)
const CHAT_CSS_KEYS = [
  CHAT_COLOR_THEME,
  CHEEZE_REMOVER,
  CHAT_SIZE,
  BLIND_REMOVER,
  SUBSCRIBE_REMOVER,
  CHEEZE_RANKING_REMOVER,
  CHAT_BADGE_REMOVER,
];

const ensureStyleEl = (): HTMLStyleElement => {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(el);
  }
  return el;
};

const refresh = () => {
  chrome.storage.local.get([...CHAT_CSS_KEYS, CHAT_NAME_COLOR, CHAT_TEXT_COLOR], res => {
    // 색상 CSS 변수를 이른 시점에 설정 → document_start 의 색상 규칙이 즉시 값을 갖는다.
    document.documentElement.style.setProperty(`--${CHAT_NAME_COLOR}`, res[CHAT_NAME_COLOR] || CHAT_NAME_COLOR_DEFAULT);
    document.documentElement.style.setProperty(`--${CHAT_TEXT_COLOR}`, res[CHAT_TEXT_COLOR] || CHAT_TEXT_COLOR_DEFAULT);

    let css = '';
    if (res[CHEEZE_REMOVER]) css += `${CHEEZE_CHAT} { display: none; }`;
    if (res[CHEEZE_RANKING_REMOVER]) css += `${CHEEZE_RANKING_CHAT} { display: none; }`;
    if (res[BLIND_REMOVER]) css += `${BLIND_CHAT} { display: none; }`;
    if (res[SUBSCRIBE_REMOVER]) css += `${SUBSCRIBE_CHAT} { display: none; }`;
    if (res[CHAT_BADGE_REMOVER]) css += `${CHATTING_BADGE} { display: none; }`;

    // 채팅 크기 설정 (기본 14가 아니면 적용)
    if (res[CHAT_SIZE] && res[CHAT_SIZE] != 14) {
      css += `${CHAT_ITEM} ${CHAT_NAME}, ${CHAT_ITEM} ${CHAT_CONTENT}, ${CHAT_ITEM_STABLE_SELECTOR}, ${CHAT_TEXT_STABLE_SELECTOR} {
          --czp-fontSize: ${res[CHAT_SIZE]}px;
          font-size: var(--czp-fontSize) !important;
          ${res[CHAT_SIZE] > 14 ? 'line-height: var(--czp-fontSize) !important;' : ''}
        }`;
    }

    // 커스텀 색상 테마
    if (res[CHAT_COLOR_THEME] === '커스텀') {
      css += `${CHAT_ITEM} ${CHAT_CONTENT} { color: var(--${CHAT_TEXT_COLOR}) !important; }`;
      css += `${CHAT_ITEM} ${CHAT_NAME}, ${CHAT_ITEM} ${CHAT_NAME} * { color: var(--${CHAT_NAME_COLOR}) !important; }`;
    }

    ensureStyleEl().innerHTML = css;
  });
};

refresh();

// 설정 변경 시 즉시 반영
chrome.storage.onChanged.addListener(changes => {
  // 색상 변수만 바뀐 경우엔 변수만 갱신 (재빌드 불필요)
  for (const key in changes) {
    if (COLOR_PROPERTIES.includes(key)) {
      document.documentElement.style.setProperty(`--${key}`, changes[key].newValue);
    }
  }
  if (CHAT_CSS_KEYS.some(key => key in changes)) {
    refresh();
  }
});
