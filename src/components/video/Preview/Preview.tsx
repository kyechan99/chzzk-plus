import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

import { logWarning } from "../../../utils/log";
import { getChannelIDByUrl } from "../../../utils/channel";
import { getHlsUrl } from "../../../utils/stream";
import { NAV_LEFT } from "../../../constants/class";

import "./Preview.css";

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [channelId, setChannelId] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);

  // 채널 변경 시 HLS 스트림 연결
  useEffect(() => {
    if (!visible || !channelId || !videoRef.current) return;

    const video = videoRef.current;

    const startStream = async () => {
      const hlsUrl = await getHlsUrl(channelId);
      if (!hlsUrl || !videoRef.current) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.play().catch(() => {});
      }
    };

    startStream().catch(logWarning);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = "";
    };
  }, [channelId, visible]);

  // 좌측 nav 마우스 이벤트 등록
  useEffect(() => {
    const $nav_left = document.querySelectorAll(NAV_LEFT);

    if (!$nav_left || $nav_left.length < 2) return;

    const $following_channel_nav = $nav_left[1];
    const $navigation = $following_channel_nav.querySelector("ul");

    if ($navigation) {
      $navigation.addEventListener("mouseover", navHoverListener);
      $navigation.addEventListener("mouseleave", navLeaveListener);
    }

    return () => {
      if ($navigation) {
        $navigation.removeEventListener("mouseover", navHoverListener);
        $navigation.removeEventListener("mouseleave", navLeaveListener);
      }
    };
  }, [containerRef]);

  const navHoverListener = (event: Event) => {
    const eventTarget = event.target as HTMLElement;
    if (eventTarget.tagName === "A") {
      try {
        const rect = eventTarget.getBoundingClientRect();
        if (containerRef.current) {
          containerRef.current.style.left = 8 + rect.right + "px";
          containerRef.current.style.top = rect.top + "px";
        }

        const href = eventTarget.getAttribute("href");
        if (href) {
          const channelID = getChannelIDByUrl(href);
          if (channelID) {
            setChannelId(channelID);
            setVisible(true);
          }
        }
      } catch (err) {
        logWarning(err);
      }
    }
  };

  const navLeaveListener = () => {
    setVisible(false);
    setChannelId("");
  };

  return (
    <div
      className="preview"
      ref={containerRef}
      style={{ display: visible ? "block" : "none" }}
    >
      <video
        ref={videoRef}
        className="preview-video"
        muted
        playsInline
        autoPlay
      />
    </div>
  );
}
