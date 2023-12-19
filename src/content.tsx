import ReactDOM from "react-dom/client";
import PipButton from "./components/button/PipButton/PipButton";
import { isLivePage } from "./utils/page";
import Barricade from "./components/video/Barricade/Barricade";
import Preview from "./components/video/Preview/Preview";
import {
  NAV_ITEMS_CLASSNAME,
  PLAYER_LAYOUT_ID,
  PLAYER_UI,
} from "./constants/class";
import { logError } from "./utils/log";

const createContentApp = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await new Promise<void>((resolve, _reject) =>
    setTimeout(() => {
      resolve();
    }, 1000)
  );

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const live_player_layout = document.getElementById(PLAYER_LAYOUT_ID);
  if (!live_player_layout) {
    createContentApp();
    return;
  }

  // Feat: PIP 실행 버튼 추가 ==================================================================
  const pipButtonRoot = document.createElement("div");
  live_player_layout.appendChild(pipButtonRoot);
  ReactDOM.createRoot(pipButtonRoot).render(<PipButton />);

  live_player_layout.addEventListener("mouseenter", () => {
    pipButtonRoot.style.display = "block";
  });

  live_player_layout.addEventListener("mouseleave", () => {
    pipButtonRoot.style.display = "none";
  });

  // Feat: Barricade (이벤트 방해 모드) =======================================================
  chrome.storage.local.get("barricade", (res) => {
    if (res["barricade"]) {
      // Pause 이벤트 막는 바리게이트 생성
      const player_header =
        live_player_layout?.getElementsByClassName(PLAYER_UI)[0];
      if (player_header && player_header.parentNode) {
        const barricade = document.createElement("div");
        player_header.parentNode.insertBefore(barricade, player_header);
        ReactDOM.createRoot(barricade).render(<Barricade />);
      }
    }
  });
};

const preview = document.createElement("div");
preview.style.position = "fixed";
preview.style.zIndex = "9999";
document.body.appendChild(preview);
ReactDOM.createRoot(preview).render(<Preview />);

const navHoverListener = (event: Event) => {
  try {
    const eventTarget = event.target as HTMLCanvasElement;
    const rect = eventTarget.getBoundingClientRect();
    preview.style.left = 32 + rect.right + "px";
    preview.style.top = rect.top + "px";
    preview.style.display = "block";
  } catch (err) {
    logError(err);
  }
};
const navLeaveListener = () => {
  preview.style.display = "none";
};

const createNav = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await new Promise<void>((resolve, _reject) =>
    setTimeout(() => {
      resolve();
    }, 1000)
  );

  const navItems = document.getElementsByClassName(NAV_ITEMS_CLASSNAME);

  if (!navItems) {
    createNav();
    return;
  }

  Array.from(navItems).forEach((item) => {
    item.addEventListener("mouseenter", navHoverListener);
    item.addEventListener("mouseleave", navLeaveListener);
  });

  const parentElement = navItems[0].parentElement;

  if (!parentElement) return;

  // MutationObserver의 콜백 함수를 정의합니다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const observerCallback: MutationCallback = (mutationsList, _observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addedNodes = mutation.addedNodes;
        const removedNodes = mutation.removedNodes;

        // 새로 추가된 자식 요소에 이벤트를 추가합니다.
        for (const addedNode of addedNodes) {
          if (addedNode instanceof HTMLElement) {
            addedNode.addEventListener("mouseenter", navHoverListener);
          }
        }

        // 제거된 자식 요소에서 이벤트를 제거합니다.
        for (const removedNode of removedNodes) {
          if (removedNode instanceof HTMLElement) {
            removedNode.addEventListener("mouseleave", navLeaveListener);
          }
        }
      }
    }
  };

  // MutationObserver 인스턴스를 생성하고 설정합니다.
  const observer = new MutationObserver(observerCallback);

  // 감지할 변화 유형과 옵션을 설정합니다.
  const config = { childList: true };

  // MutationObserver를 타겟 요소에 등록합니다.
  observer.observe(parentElement, config);
};

if (isLivePage()) {
  createContentApp();
}

createNav();
