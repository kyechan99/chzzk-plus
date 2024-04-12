import { VIDEO_LAYOUT_ID } from "../constants/class";

import { log } from "../utils/log";
import { isVideoPage } from "../utils/page";
import { createReactElement } from "../utils/dom";

import AudioCompressorButton from "../components/button/AudioCompressorButton/AudioCompressorButton";
import RecordButton from "../components/button/RecordButton/RecordButton";
import CaptureButton from "../components/button/CaptureButton/CaptureButton";

import { AUDIO_COMPRESSOR, RECORD_ENABLE } from "../constants/storage";
import { VIDEO_BUTTONS } from "../constants/class";

export const editVideoPage = () => {
  if (!isVideoPage()) return;

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(VIDEO_LAYOUT_ID);
  if (!$playerLayout) {
    return;
  }

  // if (!document.getElementById("chzzk-plus-video-helper")) {
  //   // Feat: Helper 추가 (즐겨찾기, 녹화, 캡처) =========================================================
  //   const $videoTitle = document.querySelector(
  //     ".video_information_vod_data__rK6z-"
  //   );
  //   if ($videoTitle) {
  //     // const $liveTitle = $infoHeads[0] as HTMLElement;
  //     // $liveTitle.style.justifyContent = "space-between";
  //     const $videoHelper = document.createElement("div");
  //     $videoHelper.id = "chzzk-plus-video-helper";
  //     $videoHelper.style.marginLeft = "1rem";
  //     $videoTitle.appendChild($videoHelper);
  //     createReactElement($videoHelper, VideoHelper);
  //   }
  // }

  /*
    치지직내 PIP 기능 추가되어 제거함
    // // Feat: PIP 실행 버튼 추가 ==================================================================
    // if (!document.getElementById("chzzk-plus-video-btn")) {
    //   const $btn_list = document.querySelector(VIDEO_BUTTONS);
    //   // Feat: PIP 버튼 활성화 =========================================================
    //   const $pipButtonRoot = document.createElement("div");
    //   $pipButtonRoot.id = "chzzk-plus-video-btns";
    //   $btn_list?.prepend($pipButtonRoot);
    //   createReactElement($pipButtonRoot, PipButton);
    // }
  */
  chrome.storage.local.get([AUDIO_COMPRESSOR, RECORD_ENABLE], (res) => {
    const $btn_list = document.querySelector(VIDEO_BUTTONS);

    // Feat: 오디오 압축 버튼 활성화 =======================================================
    if (
      res[AUDIO_COMPRESSOR] &&
      $btn_list &&
      !document.getElementById("chzzk-plus-compr-btns")
    ) {
      const $AudioCompressorButton = document.createElement("div");
      $AudioCompressorButton.id = "chzzk-plus-compr-btns";
      $btn_list?.prepend($AudioCompressorButton);
      createReactElement($AudioCompressorButton, AudioCompressorButton);
    }
    // Feat: 녹화, 캡처 활성화 ============================================================
    if (
      res[RECORD_ENABLE] &&
      $btn_list &&
      !document.getElementById("chzzk-plus-capture-btns")
    ) {
      const $CaptureButton = document.createElement("div");
      $CaptureButton.id = "chzzk-plus-capture-btns";
      $btn_list?.prepend($CaptureButton);
      createReactElement($CaptureButton, CaptureButton);
      const $RecordButton = document.createElement("div");
      $RecordButton.id = "chzzk-plus-record-btns";
      $btn_list?.prepend($RecordButton);
      createReactElement($RecordButton, RecordButton);
    }
  });

  log("VIDEO PAGE 설정");
};
