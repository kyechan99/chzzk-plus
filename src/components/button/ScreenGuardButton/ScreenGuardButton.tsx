import React from "react";
import "./ScreenGuardButton.css";
import { CHAT_CONTAINER, CHEEZE_RANKING_CHAT } from "../../../constants/class";

export default function ScreenGuardButton() {
  const [isHidden, setHidden] = React.useState<boolean>(false);

  const toggleScreenGuard = async () => {
    const _isHidden = !isHidden;

    const selectors = [
      ".pzp-pc__video",
      CHAT_CONTAINER,
      CHEEZE_RANKING_CHAT,
      ".video_information_link_area__cGbDP",
      ".video_information_thumbnail__KZZ9O",
      ".video_information_title__jrLfG",
    ];

    selectors.forEach((selector) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.style.filter = _isHidden
          ? `blur(${selector.includes("video_information") ? "10px" : "100px"})`
          : "none";
      }
    });

    setHidden(_isHidden);
  };

  return (
    <button
      onClick={toggleScreenGuard}
      className={`czp-screen-guard-btn ${isHidden ? "active" : ""}`}
    >
      {isHidden ? "화면 보호중..." : "화면 보호"}
    </button>
  );
}
