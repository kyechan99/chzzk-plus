import React from "react";
import "./FastButton.css";
import { INPUT_UI_LIST, WEBPLAYER_VIDEO } from "../../../constants/class";

export default function FastButton() {
  React.useEffect(() => {
    const captureEvent = (event: KeyboardEvent) => {
      const { target } = event;
      if (target instanceof HTMLElement)
        if (!INPUT_UI_LIST.includes(target.className) && !event.ctrlKey) {
          // ]: 빨리 감기
          if (event.key === "]" || event.key === "}") {
            faster();
          } else if (event.key === "[" || event.key === "{") {
            slower();
          } else if (event.key === "=" || event.key === "+") {
            normal();
          }
        }
    };

    // Feat: 플레이커 키 단축키 활성화 =========================================================
    document.addEventListener("keydown", captureEvent);
    return () => {
      document.removeEventListener("keydown", captureEvent);
    };
  }, []);

  const slower = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    const video = document.querySelector(WEBPLAYER_VIDEO) as HTMLVideoElement;

    video.playbackRate = 0.5;
  };

  const normal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    const video = document.querySelector(WEBPLAYER_VIDEO) as HTMLVideoElement;

    video.playbackRate = 1;
  };

  const faster = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    const video = document.querySelector(WEBPLAYER_VIDEO) as HTMLVideoElement;

    video.playbackRate = 2.0;
  };

  return (
    <button
      className="pzp-button pzp-setting-button pzp-pc-setting-button pzp-pc__setting-button"
      aria-label="빨리감기"
      aria-haspopup="true"
      onClick={faster}
      //   command="SettingCommands.Toggle"
    >
      <span className="pzp-button__tooltip pzp-button__tooltip--top">
        빨리감기
      </span>
      <span className="pzp-ui-icon pzp-setting-button__icon czp-fast-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pzp-ui-icon__svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="#FFF"
          fill="#FFF"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
            stroke-width="0"
            fill="currentColor"
          />
          <path
            d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
            stroke-width="0"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}
