import PipButton from "../components/button/PipButton/PipButton";

import { VIDEO_BUTTONS, VIDEO_LAYOUT_ID } from "../constants/class";

import { log } from "../utils/log";
import { isVideoPage } from "../utils/page";
import { createReactElement } from "../utils/dom";

import VideoHelper from "../components/videoHelper/VideoHelper";

export const editVideoPage = () => {
  if (!isVideoPage()) return;

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(VIDEO_LAYOUT_ID);
  if (!$playerLayout) {
    return;
  }
  if (!document.getElementById("chzzk-plus-video-helper")) {
    // Feat: Helper 추가 (즐겨찾기, 녹화, 캡처) =========================================================
    const $videoTitle = document.querySelector(
      ".video_information_vod_data__rK6z-"
    );
    if ($videoTitle) {
      // const $liveTitle = $infoHeads[0] as HTMLElement;
      // $liveTitle.style.justifyContent = "space-between";
      const $videoHelper = document.createElement("div");
      $videoHelper.id = "chzzk-plus-video-helper";
      $videoHelper.style.marginLeft = "1rem";
      $videoTitle.appendChild($videoHelper);
      createReactElement($videoHelper, VideoHelper);
    }
  }

  // Feat: PIP 실행 버튼 추가 ==================================================================
  if (!document.getElementById("chzzk-plus-video-btn")) {
    const $btn_list = document.querySelector(VIDEO_BUTTONS);
    // Feat: PIP 버튼 활성화 =========================================================
    const $pipButtonRoot = document.createElement("div");
    $pipButtonRoot.id = "chzzk-plus-video-btns";
    $btn_list?.prepend($pipButtonRoot);
    createReactElement($pipButtonRoot, PipButton);
  }

  log("VIDEO PAGE 설정");
};
