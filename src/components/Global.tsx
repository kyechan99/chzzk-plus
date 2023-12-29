import { useEffect } from "react";
import "./Global.css";
import {
  INPUT_UI_LIST,
  VIDEO_FULL_BTN,
  VIDEO_VIEW_BTN,
  VIDEO_VOLUME_BTN,
} from "../constants/class";
import { PLAYER_KEY_CONTROL } from "../constants/storage";

export default function Global() {
  useEffect(() => {
    // Feat: 플레이커 키 단축키 활성화 =========================================================
    chrome.storage.local.get(PLAYER_KEY_CONTROL, (res) => {
      // 위에서 pip 버튼 추가 체크로 재생성 걱정은 안해도 괜찮다.
      if (res[PLAYER_KEY_CONTROL]) {
        document.addEventListener("keydown", (event) => {
          const { target } = event;
          if (target instanceof HTMLElement)
            if (!INPUT_UI_LIST.includes(target.className)) {
              if(!event.ctrlKey){
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
  }, []);

  return <></>;
}
