import Barricade from "../components/video/Barricade/Barricade";
import PipButton from "../components/button/PipButton/PipButton";
import AudioCompressorButton from "../components/button/AudioCompressorButton/AudioCompressorButton";

import { PLAYER_LAYOUT_ID, PLAYER_UI } from "../constants/class";

import { createReactElement } from "../utils/dom";
import { isLivePage } from "../utils/page";
import { log } from "../utils/log";

export const editLivePage = () => {
  if (!isLivePage()) return;

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(PLAYER_LAYOUT_ID);
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

  // Feat: Audio Compressor 버튼 추가 ==================================================================
  if (!document.getElementById("chzzk-plus-audio-compressor-btn")) {
    const $bottomButtonsRight = $playerLayout.querySelector(".pzp-pc__bottom-buttons-right");

    if (!$bottomButtonsRight) return;

    const $audioCompressorRoot = document.createElement("div");
    $audioCompressorRoot.classList.add('pzp-button', 'pzp-pc-ui-button');
    $audioCompressorRoot.id = "chzzk-plus-audio-compressor-btn";
    $bottomButtonsRight.prepend($audioCompressorRoot);
    createReactElement($audioCompressorRoot, AudioCompressorButton);
    $playerLayout.addEventListener("mouseenter", () => {
      $audioCompressorRoot.style.display = "block";
    });
    $playerLayout.addEventListener("mouseleave", () => {
      $audioCompressorRoot.style.display = "none";
    });
  }

  // Feat: Barricade (이벤트 방해 모드) =======================================================
  chrome.storage.local.get("barricade", (res) => {
    if (res["barricade"] && !document.getElementById("chzzk-plus-barricade")) {
      // Pause 이벤트 막는 바리게이트 생성
      const $playerUI = $playerLayout?.getElementsByClassName(PLAYER_UI)[0];
      if ($playerUI && $playerUI.parentNode) {
        const $barricade = document.createElement("div");
        $barricade.id = "chzzk-plus-barricade";
        $playerUI.parentNode.insertBefore($barricade, $playerUI);
        createReactElement($barricade, Barricade);
      }
    }
  });

  log("LIVE PAGE 설정");
};
