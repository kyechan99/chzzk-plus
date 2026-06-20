/**
 * 브라우저 탭(title)에 시청자 수 표기.
 *
 * 라이브 페이지에서 <title> 을 "{시청자수} | {원래 제목}" 형태로 만든다.
 * 시청자 수 element 예) <strong class="_count_...">956명 시청 중</strong>
 * 같은 _count_ 클래스를 쓰는 스트리밍 시간 span 과 구분하기 위해 "시청" 텍스트로 찾는다.
 *
 * chzzk 가 자체적으로 title 을 갱신하므로, 우리가 마지막으로 설정한 값과 다르면 그것을
 * 원래 제목(base)으로 간주하고 다시 prefix 를 붙인다.
 */
import { isLivePage } from '../utils/page';
import { TAB_VIEWER_COUNT } from '../constants/storage';

let started = false;
let enabled = false;
let lastSetTitle = '';
let baseTitle = '';

const getViewerCount = (): string => {
  const els = document.querySelectorAll('[class*="_count_"]');
  for (const el of Array.from(els)) {
    const text = el.textContent || '';
    if (text.includes('시청')) return text.split('시청')[0].trim(); // "956명 시청 중" → "956명"
  }
  return '';
};

// 우리가 붙인 "{count} | " prefix 를 제거해 원래 제목을 복원 (방어용).
const stripPrefix = (title: string): string => title.replace(/^[\d.,만천]+\s*명?\s*\|\s*/, '');

const tick = (): void => {
  if (!enabled || !isLivePage()) return;

  // chzzk 가 title 을 바꿨다면 그것을 원래 제목으로 채택
  if (document.title !== lastSetTitle) baseTitle = stripPrefix(document.title);

  const count = getViewerCount();
  const next = count ? `${count} | ${baseTitle}` : baseTitle;
  if (document.title !== next) {
    document.title = next;
    lastSetTitle = next;
  }
};

export const initTabViewerCount = (): void => {
  if (started) return;
  started = true;

  chrome.storage.local.get([TAB_VIEWER_COUNT], res => {
    enabled = !!res[TAB_VIEWER_COUNT];
  });

  chrome.storage.onChanged.addListener(changes => {
    if (!(TAB_VIEWER_COUNT in changes)) return;
    enabled = !!changes[TAB_VIEWER_COUNT].newValue;
    // 끄면 우리가 붙인 prefix 제거
    if (!enabled && lastSetTitle && document.title === lastSetTitle) {
      document.title = baseTitle || stripPrefix(document.title);
      lastSetTitle = '';
    }
  });

  window.setInterval(tick, 2000);
};
