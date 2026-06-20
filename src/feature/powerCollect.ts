/**
 * 통나무(파워) 자동 수집.
 */
import { isLivePage } from '../utils/page';
import { POWER_COLLECT_ENABLE } from '../constants/storage';
import { CHAT_CONTAINER, CHAT_USER_AREA } from '../constants/class';

const BUTTON_INTERVAL = 10_000; // 받기 버튼 클릭 주기

let enabled = false;
let started = false;

// 채팅 영역의 "통나무/파워 받기" 버튼이 있으면 클릭.
const clickPowerButton = (): void => {
  if (!enabled || !isLivePage()) return;
  const chatAreaEl = document.querySelector(`${CHAT_CONTAINER} ${CHAT_USER_AREA}`);
  if (!chatAreaEl) return;

  const btn = Array.from(chatAreaEl.querySelectorAll('button')).find(b => {
    const text = b.textContent || '';
    const isReceive = (text.includes('통나무') || text.includes('파워')) && text.includes('받기');
    return isReceive;
  });
  btn?.click();
};

export const initPowerCollect = (): void => {
  if (started) return;
  started = true;

  chrome.storage.local.get([POWER_COLLECT_ENABLE], res => {
    enabled = !!res[POWER_COLLECT_ENABLE];
  });
  chrome.storage.onChanged.addListener(changes => {
    if (POWER_COLLECT_ENABLE in changes) enabled = !!changes[POWER_COLLECT_ENABLE].newValue;
  });

  window.setInterval(clickPowerButton, BUTTON_INTERVAL);
};
