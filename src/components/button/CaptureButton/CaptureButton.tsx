import React from "react";
import { logWarning } from "../../../utils/log";
import "./CaptureButton.css";
import { INPUT_UI_LIST, WEBPLAYER_VIDEO } from "../../../constants/class";

export default function CaptureButton() {
  React.useEffect(() => {
    const captureEvent = (event: KeyboardEvent) => {
      const { target } = event;
      if (target instanceof HTMLElement)
        if (!INPUT_UI_LIST.includes(target.className) && !event.ctrlKey) {
          // S: 캡처
          if (event.key === "s" || event.key === "S") {
            captureVideo();
          }
        }
    };

    // Feat: 플레이커 키 단축키 활성화 =========================================================
    document.addEventListener("keydown", captureEvent);
    return () => {
      document.removeEventListener("keydown", captureEvent);
    };
  }, []);

  const captureVideo = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    try {
      const video = document.querySelector(WEBPLAYER_VIDEO) as HTMLVideoElement;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");

      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = imageDataURL;
      downloadLink.download = `chzzk_plus_${new Date().getTime()}.png`;
      downloadLink.click();
    } catch (err) {
      logWarning(err);
    }
  };

  return (
    <button
      aria-label="캡처"
      className="pzp-button pzp-pc-setting-button pzp-pc__setting-button pzp-pc-ui-button"
      data-active="false"
      onClick={captureVideo}
    >
      <span className="pzp-pc-ui-button__tooltip pzp-pc-ui-button__tooltip--top">
        캡처
      </span>
      <span className="pzp-ui-icon pzp-pc-setting-button__icon czp-pc-capture-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pzp-ui-icon__svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
          <path d="M4 16v2a2 2 0 0 0 2 2h2" />
          <path d="M16 4h2a2 2 0 0 1 2 2v2" />
          <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
          <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        </svg>
      </span>
    </button>
  );
}
