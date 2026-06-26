/**
 * 통나무(파워) 자동 수집.
 */
import { isLivePage } from '../utils/page';
import { POWER_COLLECT_ENABLE } from '../constants/storage';
import { CHAT_CONTAINER } from '../constants/class';
import { getChannelIDByUrl } from '../utils/channel';
import { logWarning } from '../utils/log';

const API_BASE = 'https://api.chzzk.naver.com/service/v1';
const COLLECT_INTERVAL = 60_000; // API claim 수령 주기
const BUTTON_INTERVAL = 5_000; // 보조 버튼 클릭 주기

let enabled = false;
let started = false;
let collecting = false;

const collectViaApi = async (): Promise<void> => {
  if (!enabled || !isLivePage() || collecting) return;
  const channelId = getChannelIDByUrl(location.pathname);
  if (!channelId) return;

  collecting = true;
  try {
    const res = await fetch(`${API_BASE}/channels/${channelId}/log-power`, { credentials: 'include' });
    if (!res.ok) return;

    const data = await res.json();
    const claims: Array<{ claimId: string }> = data?.content?.claims ?? [];
    if (claims.length === 0) return;

    for (const claim of claims) {
      try {
        await fetch(`${API_BASE}/channels/${channelId}/log-power/claims/${claim.claimId}`, {
          method: 'PUT',
          credentials: 'include',
        });
      } catch {
        /* 개별 실패 무시 */
      }
    }
  } catch (err) {
    logWarning(err);
  } finally {
    collecting = false;
  }
};

// 보조: 채팅 영역(#aside-chatting)의 "통나무 받기" 버튼이 보이면 클릭.
const clickPowerButton = (): void => {
  if (!enabled || !isLivePage()) return;
  const aside = document.querySelector(CHAT_CONTAINER);
  if (!aside) return;

  const btn = Array.from(aside.querySelectorAll('button')).find(b => b.className.includes('power_button'));
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

  window.setInterval(collectViaApi, COLLECT_INTERVAL);
  window.setInterval(clickPowerButton, BUTTON_INTERVAL);
  window.setTimeout(collectViaApi, 3000); // 진입 직후 1회
};
