// import "./PipButton.css";

import React from "react";
import { INPUT_UI_LIST } from "../../../constants/class";

export default function PipButton() {
  const video = document.getElementsByTagName("video")[0];
  video.disablePictureInPicture = false;

  const operatePIP = () => {
    if (video) {
      video.requestPictureInPicture();

      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture();
      } else {
        video.requestPictureInPicture();
      }
    }
  };

  React.useEffect(() => {
    const captureEvent = (event: KeyboardEvent) => {
      const { target } = event;
      if (target instanceof HTMLElement)
        if (!INPUT_UI_LIST.includes(target.className) && !event.ctrlKey) {
          // ]: 빨리 감기
          if (event.key === "q" || event.key === "Q") {
            operatePIP();
          }
        }
    };

    // Feat: 플레이커 키 단축키 활성화 =========================================================
    document.addEventListener("keydown", captureEvent);
    return () => {
      document.removeEventListener("keydown", captureEvent);
    };
  }, []);

  return <></>;
}
