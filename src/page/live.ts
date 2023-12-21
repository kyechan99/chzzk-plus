import Barricade from "../components/video/Barricade/Barricade";
import PipButton from "../components/button/PipButton/PipButton";

import { isLivePage } from "../utils/page";
import { log, logError } from "../utils/log";
import { getNameColor } from "../utils/color";
import { createReactElement } from "../utils/dom";

import {
  CHAT_CONTAINER,
  CHAT_CONTENT,
  CHAT_NAME,
  CHEEZE_CHAT,
  INPUT_UI_LIST,
  LIVE_INFORMATION_HEAD,
  PLAYER_LAYOUT_ID,
  PLAYER_UI,
  VIDEO_FULL_BTN,
  VIDEO_VIEW_BTN,
  VIDEO_VOLUME_BTN,
} from "../constants/class";
import {
  BARRICADE,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_TEXT_COLOR,
  CHEEZE_REMOVER,
  PLAYER_KEY_CONTROL,
} from "../constants/storage";
import CaptureButton from "../components/button/CaptureButton/CaptureButton";

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

    // Feat: 플레이커 키 단축키 활성화 =========================================================
    chrome.storage.local.get(PLAYER_KEY_CONTROL, (res) => {
      // 위에서 pip 버튼 추가 체크로 재생성 걱정은 안해도 괜찮다.
      if (res[PLAYER_KEY_CONTROL]) {
        document.addEventListener("keydown", (event) => {
          const { target } = event;
          if (target instanceof HTMLElement)
            if (!INPUT_UI_LIST.includes(target.className)) {
              // T : 넓은 화면
              if (event.key === "t" || event.key === "T") {
                const viewModeBtn = document.querySelector(
                  VIDEO_VIEW_BTN
                ) as HTMLElement;
                if (viewModeBtn) viewModeBtn.click();
              }

              // F : 전체 화면
              if (event.key === "f" || event.key === "F") {
                const fullScreenBtn = document.querySelector(
                  VIDEO_FULL_BTN
                ) as HTMLElement;
                if (fullScreenBtn) fullScreenBtn.click();
              }
              // M : 음소거
              if (event.key === "m" || event.key === "M") {
                const muteBtn = document.querySelector(
                  VIDEO_VOLUME_BTN
                ) as HTMLElement;
                if (muteBtn) muteBtn.click();
              }
            }
        });
      }
    });

    const $infoHeads = document.getElementsByClassName(LIVE_INFORMATION_HEAD);
    if ($infoHeads.length > 0) {
      const $liveTitle = $infoHeads[0] as HTMLElement;
      $liveTitle.style.justifyContent = "space-between";
      const $liveHelper = document.createElement("div");
      $liveHelper.id = "chzzk-plus-live-helper";
      $liveTitle.appendChild($liveHelper);
      createReactElement($liveHelper, CaptureButton);
    }
  }

  // Feat: Barricade (이벤트 방해 모드) =======================================================
  chrome.storage.local.get(BARRICADE, (res) => {
    if (res[BARRICADE] && !document.getElementById("chzzk-plus-barricade")) {
      // Pause 이벤트 막는 바리게이트 생성
      const $playerUI = $playerLayout.getElementsByClassName(PLAYER_UI)[0];
      if ($playerUI && $playerUI.parentNode) {
        const $barricade = document.createElement("div");
        $barricade.id = "chzzk-plus-barricade";
        $playerUI.parentNode.insertBefore($barricade, $playerUI);
        createReactElement($barricade, Barricade);
      }
    }
  });

  // Feat: 채팅 색상, 치즈 제거 ===============================================================
  chrome.storage.local.get(
    [CHAT_COLOR_THEME, CHEEZE_REMOVER, CHAT_SIZE],
    (res) => {
      const chatContainer = document.querySelector(
        `div[class*="${CHAT_CONTAINER}"]`
      );

      if (chatContainer && res[CHAT_COLOR_THEME] !== "기본") {
        if (res[CHAT_COLOR_THEME] && chatContainer.id !== CHAT_COLOR_THEME) {
          chatContainer.id = CHAT_COLOR_THEME;

          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const observer = new MutationObserver((mutationList, _observer) => {
              for (const mutation of mutationList) {
                for (const addedNode of mutation.addedNodes as NodeListOf<HTMLElement>) {
                  if (res[CHEEZE_REMOVER]) {
                    if (addedNode.className === CHEEZE_CHAT) {
                      addedNode.style.display = "none";
                      continue;
                    }
                  }

                  const nickname = addedNode.querySelector(
                    CHAT_NAME
                  ) as HTMLElement;
                  const text = addedNode.querySelector(
                    CHAT_CONTENT
                  ) as HTMLElement;

                  if (text) {
                    text.style.color = `var(--${CHAT_TEXT_COLOR})`;
                    if (res[CHAT_SIZE]) {
                      text.style.fontSize = `${res[CHAT_SIZE]}px`;
                    }
                  }

                  if (nickname) {
                    if (res[CHAT_COLOR_THEME] === "테마") {
                      nickname.style.color = getNameColor(
                        nickname.textContent || ""
                      );
                    } else if (res[CHAT_COLOR_THEME] === "커스텀") {
                      nickname.style.color = `var(--${CHAT_NAME_COLOR})`;
                    }
                    if (res[CHAT_SIZE]) {
                      nickname.style.fontSize = `${res[CHAT_SIZE]}px`;
                    }
                  }
                }
              }
            });

            observer.observe(chatContainer, { childList: true, subtree: true });
          } catch (err) {
            logError(err);
          }
        }
      }
    }
  );

  log("LIVE PAGE 설정");
};
