import PipButton from "../components/button/PipButton/PipButton";

import { VIDEO_LAYOUT_ID } from "../constants/class";

import { createReactElement } from "../utils/dom";
import { isVideoPage } from "../utils/page";
import { log } from "../utils/log";

export const editVideoPage = () => {
  if (!isVideoPage()) return;

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(VIDEO_LAYOUT_ID);
  if (!$playerLayout) {
    return;
  }

  // Feat: PIP 실행 버튼 추가 ==================================================================
  if (!document.getElementById("chzzk-plus-pip-btn")) {
    const $pipButtonRoot = document.createElement("div");
    $pipButtonRoot.id = "chzzk-plus-pip-btn";
    $playerLayout.appendChild($pipButtonRoot);
    createReactElement($pipButtonRoot, PipButton);
    $playerLayout.addEventListener("mouseenter", () => {
      $pipButtonRoot.style.display = "block";
    });
    $playerLayout.addEventListener("mouseleave", () => {
      $pipButtonRoot.style.display = "none";
    });
  }

  log("VIDEO PAGE 설정");
};
