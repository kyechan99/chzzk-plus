import ReactDOM from "react-dom/client";
import PipButton from "./components/button/PipButton/PipButton";
import { isLivePage } from "./utils/page";
import Barricade from "./components/video/Barricade/Barricade";

const createContentApp = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await new Promise<void>((resolve, _reject) =>
    setTimeout(() => {
      resolve();
    }, 1000)
  );

  // 영상 Layout이 발견이 되었다면 content를 수정할 준비가 되었음.
  const live_player_layout = document.getElementById("live_player_layout");
  if (!live_player_layout) {
    createContentApp();
    return;
  }

  // PIP 실행 버튼 추가
  const pipButtonRoot = document.createElement("div");
  live_player_layout.appendChild(pipButtonRoot);
  ReactDOM.createRoot(pipButtonRoot).render(<PipButton />);

  live_player_layout.addEventListener("mouseenter", () => {
    pipButtonRoot.style.display = "block";
  });

  live_player_layout.addEventListener("mouseleave", () => {
    pipButtonRoot.style.display = "none";
  });

  chrome.storage.local.get("barricade", (res) => {
    if (res["barricade"]) {
      // Pause 이벤트 막는 바리게이트 생성
      const player_header =
        live_player_layout?.getElementsByClassName("player_header")[0];
      if (player_header && player_header.parentNode) {
        const barricade = document.createElement("div");
        player_header.parentNode.insertBefore(barricade, player_header);
        ReactDOM.createRoot(barricade).render(<Barricade />);
      }
    }
  });
};

if (isLivePage()) {
  createContentApp();
}
