/**
 * 브라우저 탭 title에 시청자 수를 표시한다.
 */
import { isLivePage } from '../utils/page';
import { TAB_VIEWER_COUNT } from '../constants/storage';

let started = false;
let enabled = false;
let lastSetTitle = '';
let baseTitle = '';

const normalizeViewerText = (text: string): string => {
  const compact = text.replace(/\s+/g, ' ').trim();
  const match = compact.match(/(?:시청자\s*)?([\d,.]+(?:만|천)?\s*명?)\s*시청|시청자\s*([\d,.]+(?:만|천)?\s*명?)/);
  return (match?.[1] ?? match?.[2] ?? '').trim();
};

const getViewerCount = (): string => {
  const els = document.querySelectorAll('[class*="_count_"]');
  for (const el of Array.from(els)) {
    const count = normalizeViewerText(el.textContent || '');
    if (count) return count;
  }
  return '';
};

const stripPrefix = (title: string): string => title.replace(/^[\d.,만천]+\s*명?\s*\|\s*/, '');

const tick = (): void => {
  if (!enabled || !isLivePage()) return;

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
    if (!enabled && lastSetTitle && document.title === lastSetTitle) {
      document.title = baseTitle || stripPrefix(document.title);
      lastSetTitle = '';
    }
  });

  window.setInterval(tick, 2000);
};
