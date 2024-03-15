/* eslint-disable @typescript-eslint/no-explicit-any */
import { WEBPLAYER_VIDEO } from "../constants/class";
import { getChannelIDByUrl, getChannelOpenLive } from "./channel";
import { isLivePage } from "./page";

let interTraceOpenLive: number | undefined;
export const traceOpenLive = async () => {
  let isStreaming: boolean = false;
  const channelId: string = getChannelIDByUrl(window.location.href);

  isStreaming = await getChannelOpenLive(channelId);

  if (interTraceOpenLive) {
    clearInterval(interTraceOpenLive);
  }

  interTraceOpenLive = setInterval(async () => {
    if (!isLivePage()) {
      clearInterval(interTraceOpenLive);
      return;
    }

    if (isStreaming) {
      // WEBPLAYER_VIDEO 가 발견되면 생방송 중임
      const $video = document.querySelector(WEBPLAYER_VIDEO);
      if ($video && $video.getAttribute("src")) {
        isStreaming = false;
        clearInterval(interTraceOpenLive);
      }
    } else {
      const curOpenLive = await getChannelOpenLive(channelId);

      if (isStreaming !== curOpenLive) {
        clearInterval(interTraceOpenLive);
        // 라이브가 시작되면 새로고침
        window.location.reload();
      }
    }
  }, 5000);
};
