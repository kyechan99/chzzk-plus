/**
 * 비디오 지연 시간(버퍼)을 채팅 입력창 placeholder 에 표시한다.
 *
 * 라이브 스트림에서 현재 재생 위치가 라이브 엣지(seekable 끝)로부터 얼마나 뒤처져 있는지를
 * "지연 시간"으로 본다. seekable 이 없으면 버퍼 끝 - 현재 위치로 대체한다.
 */
import { CHAT_INPUT, WEBPLAYER_VIDEO } from '../constants/class';
import { BUFFER_DISPLAY_ENABLE } from '../constants/storage';
import { getChatInputEditable } from '../utils/chatDom';

let timer: number | undefined;
let started = false;

const computeLatency = (video: HTMLVideoElement): number | null => {
  try {
    if (video.seekable && video.seekable.length > 0) {
      return Math.max(0, video.seekable.end(video.seekable.length - 1) - video.currentTime);
    }
    if (video.buffered && video.buffered.length > 0) {
      return Math.max(0, video.buffered.end(video.buffered.length - 1) - video.currentTime);
    }
  } catch {
    /* seekable/buffered 접근 실패 시 무시 */
  }
  return null;
};

const tick = (): void => {
  const video = document.querySelector<HTMLVideoElement>(WEBPLAYER_VIDEO);
  const input = getChatInputEditable() ?? document.querySelector<HTMLElement>(CHAT_INPUT);
  if (!video || !input) return;

  const latency = computeLatency(video);
  if (latency == null) return;

  input.setAttribute('placeholder', `⏱ 지연 시간 ${latency.toFixed(1)}초 (J)`);
};

/** 라이브 페이지에서 호출. 한 번만 인터벌을 설정한다. */
export const bufferDisplaySetting = (): void => {
  if (started) return;
  chrome.storage.local.get([BUFFER_DISPLAY_ENABLE], res => {
    if (!res[BUFFER_DISPLAY_ENABLE]) return;
    started = true;
    clearInterval(timer);
    timer = window.setInterval(tick, 1000);
  });
};
