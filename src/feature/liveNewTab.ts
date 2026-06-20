/**
 * 방송(/live/**) 링크 클릭 시 새 탭으로 열기.
 *  - LIVE_NEW_TAB: 새 탭으로 열기 on/off
 *  - LIVE_NEW_TAB_BACKGROUND: (하위) 백그라운드 탭으로 열기 on/off
 *
 * href 에 /live/ 가 포함된 a 태그의 좌클릭을 가로채, SPA 이동 대신 새 탭을 연다.
 * 백그라운드 탭 생성은 content script 에서 직접 못 하므로 background 워커에 위임한다
 * (chrome.tabs.create 는 별도 권한이 필요 없다).
 *
 * 클릭 시점에 동기적으로 preventDefault 해야 하므로 설정값은 캐시해두고 storage 변경을 구독한다.
 */
import { LIVE_NEW_TAB, LIVE_NEW_TAB_BACKGROUND } from '../constants/storage';

let initialized = false;
let newTabEnabled = false;
let backgroundEnabled = false;

const onClick = (e: MouseEvent): void => {
  if (!newTabEnabled) return;
  // 평범한 좌클릭만 처리 (보조키/중클릭은 브라우저 기본 동작에 맡김)
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const target = e.target as HTMLElement | null;
  const anchor = target?.closest?.('a');
  if (!anchor) return;

  const href = anchor.getAttribute('href') || '';
  if (!href.includes('/live/')) return;

  // SPA 내비게이션/기본 이동을 막고 새 탭으로 연다.
  e.preventDefault();
  e.stopPropagation();

  chrome.runtime.sendMessage({
    type: 'czp-open-tab',
    url: anchor.href, // 절대 URL
    active: !backgroundEnabled,
  });
};

export const initLiveNewTab = (): void => {
  if (initialized) return;
  initialized = true;

  chrome.storage.local.get([LIVE_NEW_TAB, LIVE_NEW_TAB_BACKGROUND], res => {
    newTabEnabled = !!res[LIVE_NEW_TAB];
    backgroundEnabled = !!res[LIVE_NEW_TAB_BACKGROUND];
  });

  chrome.storage.onChanged.addListener(changes => {
    if (LIVE_NEW_TAB in changes) newTabEnabled = !!changes[LIVE_NEW_TAB].newValue;
    if (LIVE_NEW_TAB_BACKGROUND in changes) backgroundEnabled = !!changes[LIVE_NEW_TAB_BACKGROUND].newValue;
  });

  // capture 단계에서 가로채 chzzk 의 SPA 클릭 핸들러보다 먼저 처리한다.
  document.addEventListener('click', onClick, true);
};
