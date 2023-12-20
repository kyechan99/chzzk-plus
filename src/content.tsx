import Preview from "./components/video/Preview/Preview";
import Barricade from "./components/video/Barricade/Barricade";
import PipButton from "./components/button/PipButton/PipButton";

import { PLAYER_LAYOUT_ID, PLAYER_UI } from "./constants/class";

import { isLivePage } from "./utils/page";
import { createReactElement } from "./utils/dom";

const editLivePage = () => {
  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const $playerLayout = document.getElementById(PLAYER_LAYOUT_ID);
  if (!$playerLayout) {
    editLivePage();
    return;
  }

  // Feat: PIP 실행 버튼 추가 ==================================================================
  const $pipButtonRoot = document.createElement("div");
  $playerLayout.appendChild($pipButtonRoot);
  createReactElement($pipButtonRoot, PipButton);

  $playerLayout.addEventListener("mouseenter", () => {
    $pipButtonRoot.style.display = "block";
  });
  $playerLayout.addEventListener("mouseleave", () => {
    $pipButtonRoot.style.display = "none";
  });

  // Feat: Barricade (이벤트 방해 모드) =======================================================
  chrome.storage.local.get("barricade", (res) => {
    if (res["barricade"]) {
      // Pause 이벤트 막는 바리게이트 생성
      const $playerUI = $playerLayout?.getElementsByClassName(PLAYER_UI)[0];
      if ($playerUI && $playerUI.parentNode) {
        const barricade = document.createElement("div");
        $playerUI.parentNode.insertBefore(barricade, $playerUI);
        createReactElement(barricade, Barricade);
      }
    }
  });
};

const editGlobalPage = () => {
  // Feat: Preview 썸네일 =====================================================================
  const $preview = document.createElement("div");
  document.body.appendChild($preview);
  createReactElement($preview, Preview);
};

const waitingSPALoaded = setInterval(() => {
  const isBodyLoaded = !!document.body;
  if (isBodyLoaded) {
    clearInterval(waitingSPALoaded);

    if (isLivePage()) {
      editLivePage();
    }
    editGlobalPage();
  }
}, 500);
