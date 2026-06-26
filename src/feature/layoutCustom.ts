/**
 * 레이아웃 커스텀.
 *
 * 좌측 #sidebar 의 우측 모서리, 우측 #aside-chatting 의 좌측 모서리에 드래그 핸들을 띄워
 * 너비를 마우스로 조절한다.
 *  - #sidebar 너비를 바꾸면 #layout-body 의 padding-left 도 함께 조절 (사이드바는 layout 바깥)
 *  - #aside-chatting 은 #layout-body 의 자식이라 자기 width 만 조절
 *
 * 적용은 <style> 주입(+ !important)으로 하여 chzzk 의 기본 규칙과 React 재렌더에도 견딘다.
 *  - on/off: 핸들 표시 + 조절
 *  - 항상 적용: 페이지 로드/이동마다 저장된 값을 재적용
 *  - 초기화: 저장값을 기본값(240/353)으로 되돌림
 */
import {
  LAYOUT_CHAT_WIDTH,
  LAYOUT_CUSTOM_ENABLE,
  LAYOUT_CUSTOM_PERSIST,
  LAYOUT_SIDEBAR_WIDTH,
} from '../constants/storage';
import { CHAT_CONTAINER, LAYOUT_WRAP, SIDEBAR, VOD_ASIDE } from '../constants/class';

// 우측 패널(라이브 채팅 / VOD aside). 팝업 채팅은 제외. 둘은 동시에 존재하지 않는다.
const RIGHT_PANEL = `${CHAT_CONTAINER}:not([class*="_is_popup_chat_"]), ${VOD_ASIDE}`;

const STYLE_ID = 'czp-layout-custom-style';
const HANDLE_STYLE_ID = 'czp-layout-handle-style';

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 600;
const CHAT_MIN = 280;
const CHAT_MAX = 700;

let started = false;
let enabled = false;
let persist = false;
let applied = false;
// null = 사용자가 조절하지 않음 → 사이트 기본값을 그대로 둔다(우리 CSS 미주입).
let sidebarWidth: number | null = null;
let chatWidth: number | null = null;

let sidebarHandle: HTMLElement | null = null;
let chatHandle: HTMLElement | null = null;
let rafId: number | null = null;

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/* ── 적용 <style> ─────────────────────────────────────────── */
// 사용자가 조절한 값(null 아님)에 대해서만 규칙을 만든다 → 미조절 시 사이트 기본값 유지.
const buildCss = (): string => {
  let css = '';
  if (sidebarWidth != null) {
    css += `@media (min-width: 1200px) {
      ${SIDEBAR}[class*="_is_expanded_"] { width: ${sidebarWidth}px !important; }
      #${LAYOUT_WRAP}[class*="_is_expanded_"] { padding-left: ${sidebarWidth}px !important; }
    }`;
  }
  if (chatWidth != null) {
    // aspect-ratio <= 1/1 (세로/정사각)에서는 chzzk 가 채팅을 세로 배치(column)로 바꾸므로,
    // 그때는 고정 너비를 주지 않는다. 가로형(aspect-ratio > 1/1)에서만 적용.
    css += `
      @media (aspect-ratio > 1/1) {
        ${CHAT_CONTAINER}:not([class*="_is_popup_chat_"]) { width: ${chatWidth}px !important; flex: none !important; }
        ${VOD_ASIDE} { width: ${chatWidth}px !important; flex: none !important; }
      }`;
  }
  return css;
};

const applyStyle = (): void => {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = buildCss();
  applied = true;
};

const removeStyle = (): void => {
  document.getElementById(STYLE_ID)?.remove();
  applied = false;
};

/* ── 드래그 핸들 ──────────────────────────────────────────── */
const ensureHandleStyle = (): void => {
  if (document.getElementById(HANDLE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HANDLE_STYLE_ID;
  style.textContent = `
    .czp-resize-handle { position: fixed; z-index: 2147483646; width: 8px;
      cursor: ew-resize; background: transparent; transition: background .15s; }
    .czp-resize-handle:hover, .czp-resize-handle.czp-dragging { background: rgba(0,255,163,0.5); }
  `;
  (document.head || document.documentElement).appendChild(style);
};

const startDrag = (e: MouseEvent, kind: 'sidebar' | 'chat'): void => {
  e.preventDefault();
  const startX = e.clientX;
  // 기준 너비: 저장된 커스텀 값이 있으면 그것, 없으면 현재 실제 렌더 너비(=사이트 기본값).
  const selector = kind === 'sidebar' ? SIDEBAR : RIGHT_PANEL;
  const rectWidth = document.querySelector(selector)?.getBoundingClientRect().width;
  const stored = kind === 'sidebar' ? sidebarWidth : chatWidth;
  const startW = stored ?? rectWidth ?? (kind === 'sidebar' ? SIDEBAR_MIN : CHAT_MIN);
  const handle = kind === 'sidebar' ? sidebarHandle : chatHandle;
  handle?.classList.add('czp-dragging');
  document.body.style.userSelect = 'none';

  const onMove = (ev: MouseEvent): void => {
    if (kind === 'sidebar') {
      sidebarWidth = clamp(startW + (ev.clientX - startX), SIDEBAR_MIN, SIDEBAR_MAX);
    } else {
      // 우측 패널: 좌측 모서리를 왼쪽으로 끌수록 넓어진다
      chatWidth = clamp(startW + (startX - ev.clientX), CHAT_MIN, CHAT_MAX);
    }
    applyStyle();
  };

  const onUp = (): void => {
    document.body.style.userSelect = '';
    handle?.classList.remove('czp-dragging');
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    // 드래그한 쪽 값만 저장 (기본값은 저장하지 않음)
    const key = kind === 'sidebar' ? LAYOUT_SIDEBAR_WIDTH : LAYOUT_CHAT_WIDTH;
    const value = kind === 'sidebar' ? sidebarWidth : chatWidth;
    chrome.storage.local.set({ [key]: value });
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
};

const ensureHandles = (): void => {
  ensureHandleStyle();
  if (!sidebarHandle) {
    sidebarHandle = document.createElement('div');
    sidebarHandle.className = 'czp-resize-handle';
    sidebarHandle.addEventListener('mousedown', e => startDrag(e, 'sidebar'));
    document.body.appendChild(sidebarHandle);
  }
  if (!chatHandle) {
    chatHandle = document.createElement('div');
    chatHandle.className = 'czp-resize-handle';
    chatHandle.addEventListener('mousedown', e => startDrag(e, 'chat'));
    document.body.appendChild(chatHandle);
  }
};

// 핸들을 대상 엘리먼트 모서리에 맞춰 계속 위치시킨다.
const positionHandles = (): void => {
  if (!enabled) return;

  const sb = document.querySelector(SIDEBAR);
  if (sidebarHandle) {
    const expanded = sb?.matches('[class*="_is_expanded_"]');
    const r = sb?.getBoundingClientRect();
    if (sb && expanded && r && r.width > 0) {
      sidebarHandle.style.display = 'block';
      sidebarHandle.style.left = `${r.right - 4}px`;
      sidebarHandle.style.top = `${r.top}px`;
      sidebarHandle.style.height = `${r.height}px`;
    } else {
      sidebarHandle.style.display = 'none';
    }
  }

  const chat = document.querySelector(RIGHT_PANEL);
  if (chatHandle) {
    const r = chat?.getBoundingClientRect();
    if (chat && r && r.width > 0) {
      chatHandle.style.display = 'block';
      chatHandle.style.left = `${r.left - 4}px`;
      chatHandle.style.top = `${r.top}px`;
      chatHandle.style.height = `${r.height}px`;
    } else {
      chatHandle.style.display = 'none';
    }
  }

  rafId = requestAnimationFrame(positionHandles);
};

const startRaf = (): void => {
  if (rafId === null) rafId = requestAnimationFrame(positionHandles);
};
const stopRaf = (): void => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (sidebarHandle) sidebarHandle.style.display = 'none';
  if (chatHandle) chatHandle.style.display = 'none';
};

const setEnabled = (on: boolean): void => {
  enabled = on;
  if (on) {
    ensureHandles();
    startRaf();
    if (persist) applyStyle();
  } else {
    stopRaf();
    removeStyle();
  }
};

export const initLayoutCustom = (): void => {
  if (started) return;
  started = true;

  chrome.storage.local.get(
    [LAYOUT_CUSTOM_ENABLE, LAYOUT_CUSTOM_PERSIST, LAYOUT_SIDEBAR_WIDTH, LAYOUT_CHAT_WIDTH],
    res => {
      persist = !!res[LAYOUT_CUSTOM_PERSIST];
      sidebarWidth = typeof res[LAYOUT_SIDEBAR_WIDTH] === 'number' ? res[LAYOUT_SIDEBAR_WIDTH] : null;
      chatWidth = typeof res[LAYOUT_CHAT_WIDTH] === 'number' ? res[LAYOUT_CHAT_WIDTH] : null;
      setEnabled(!!res[LAYOUT_CUSTOM_ENABLE]);
    },
  );

  chrome.storage.onChanged.addListener(changes => {
    // 값 변경/삭제(초기화) 반영. 삭제 시 null → 규칙 제거되어 사이트 기본값 복원.
    if (LAYOUT_SIDEBAR_WIDTH in changes) {
      const v = changes[LAYOUT_SIDEBAR_WIDTH].newValue;
      sidebarWidth = typeof v === 'number' ? v : null;
      if (applied) applyStyle();
    }
    if (LAYOUT_CHAT_WIDTH in changes) {
      const v = changes[LAYOUT_CHAT_WIDTH].newValue;
      chatWidth = typeof v === 'number' ? v : null;
      if (applied) applyStyle();
    }
    if (LAYOUT_CUSTOM_PERSIST in changes) {
      persist = !!changes[LAYOUT_CUSTOM_PERSIST].newValue;
      if (enabled) (persist ? applyStyle : removeStyle)();
    }
    if (LAYOUT_CUSTOM_ENABLE in changes) {
      setEnabled(!!changes[LAYOUT_CUSTOM_ENABLE].newValue);
    }
  });
};
