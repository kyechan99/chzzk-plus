import { useRef, useState } from "react";
// import { logError } from "../../../utils/log";
import "./RecordButton.css";
import { WEBPLAYER_VIDEO } from "../../../constants/class";

interface Video extends HTMLMediaElement {
  captureStream: () => MediaStream;
}

export default function RecordButton() {
  const [recording, setRecording] = useState<number>(0); // 0: 준비상태   1: 녹화중    2: 저장중
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const clickedHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
    const $video = document.querySelector(WEBPLAYER_VIDEO) as Video | null;

    if (!$video || recording !== 0) return;

    $video.muted = false;
    // $video.volume = 0.5;

    const stream = $video.captureStream();
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      if (recordedVideoRef.current) {
        recordedVideoRef.current.src = URL.createObjectURL(blob);

        recordedVideoRef.current.addEventListener(
          "loadedmetadata",
          () => {
            void (async () => {
              setRecording(2);

              await new Promise((resolve) => setTimeout(resolve, 1000));

              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `chzzk_plus_v${new Date().getTime()}.mp4`;
              a.click();

              setRecording(0);
            })();
          },
          { once: true }
        );
      }
      recordedChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    setRecording(1);
  };

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // setRecording(0);
    }
  }

  return (
    <div>
      <video
        ref={recordedVideoRef}
        style={{ display: "none" }}
        width="1280"
        height="720"
      />

      <button
        aria-label="녹화"
        className={`pzp-button pzp-pc-setting-button pzp-pc__setting-button pzp-pc-ui-button audio-compressor-button`}
        data-active="false"
        onClick={clickedHandler}
      >
        <span className="pzp-pc-ui-button__tooltip pzp-pc-ui-button__tooltip--top">
          {
            {
              0: "녹화",
              1: "녹화중",
              2: "저장중",
            }[recording]
          }
        </span>
        <span
          className={`pzp-ui-icon pzp-pc-setting-button__icon czp-record-btn ${
            recording === 1 ? "recording" : ""
          }`}
        >
          {recording === 2 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="pzp-ui-icon__svg"
            >
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pzp-ui-icon__svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M8 5.072a8 8 0 1 1 -3.995 7.213l-.005 -.285l.005 -.285a8 8 0 0 1 3.995 -6.643z"
                stroke-width="0"
                fill="currentColor"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
