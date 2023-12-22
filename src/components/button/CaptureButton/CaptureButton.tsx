import { logError } from "../../../utils/log";
import "./CaptureButton.css";

export default function CaptureButton() {
  const captureVideo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const video = document.querySelector(
        ".webplayer-internal-video"
      ) as HTMLVideoElement;
      const canvas = document.querySelector(
        ".pzp-space-creator.pzp-pc__space-creator"
      ) as HTMLCanvasElement;
      const context = canvas.getContext("2d");

      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = imageDataURL;
      downloadLink.download = `chzzk_plus_${new Date().getTime()}.png`;
      downloadLink.click();
    } catch (err) {
      logError(err);
    }
  };

  return (
    <button className="capture-btn" onClick={captureVideo}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-capture"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
        <path d="M4 16v2a2 2 0 0 0 2 2h2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
        <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      </svg>
      캡처
    </button>
  );
}
