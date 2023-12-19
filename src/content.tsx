import ReactDOM from "react-dom/client";
import PipButton from "./components/button/PipButton/PipButton";
import { isLivePage } from "./utils/page";

const createContentApp = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await new Promise<void>((resolve, _reject) =>
    setTimeout(() => {
      resolve();
    }, 1000)
  );

  // 영상 Layout
  const live_player_layout = document.getElementById("live_player_layout");
  if (live_player_layout) {
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
  } else {
    createContentApp();
  }
};

if (isLivePage()) {
  createContentApp();
}
