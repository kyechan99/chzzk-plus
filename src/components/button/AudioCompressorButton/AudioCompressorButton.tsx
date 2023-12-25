import { useCallback, useRef, useState } from "react";

export default function AudioCompressorButton() {
  const video: HTMLVideoElement = document.querySelector(
    ".webplayer-internal-video"
  )!;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  const [acActive, setAcActive] = useState(false);

  const onClickHandler = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const button = e.currentTarget;
      const active = button.getAttribute("data-active");

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();

        sourceRef.current = audioCtxRef.current.createMediaElementSource(video);
        compressorRef.current = audioCtxRef.current.createDynamicsCompressor();

        compressorRef.current.threshold.setValueAtTime(
          -50,
          audioCtxRef.current.currentTime
        );
        compressorRef.current.knee.setValueAtTime(
          40,
          audioCtxRef.current.currentTime
        );
        compressorRef.current.ratio.setValueAtTime(
          12,
          audioCtxRef.current.currentTime
        );
        compressorRef.current.attack.setValueAtTime(
          0,
          audioCtxRef.current.currentTime
        );
        compressorRef.current.release.setValueAtTime(
          0.25,
          audioCtxRef.current.currentTime
        );

        sourceRef.current.connect(audioCtxRef.current.destination);
      }

      if (active === "false") {
        button.setAttribute("data-active", "true");

        sourceRef.current?.disconnect(audioCtxRef.current.destination);
        sourceRef.current?.connect(compressorRef.current!);
        compressorRef.current?.connect(audioCtxRef.current.destination);
        setAcActive(true);
      } else if (active === "true") {
        button.setAttribute("data-active", "false");

        sourceRef.current!.disconnect(compressorRef.current!);
        compressorRef.current!.disconnect(audioCtxRef.current.destination);
        sourceRef.current!.connect(audioCtxRef.current.destination);
        setAcActive(false);
      }
    },
    []
  );

  return (
    <button
      aria-label="오디오 압축"
      className="pzp-button pzp-pc-setting-button pzp-pc__setting-button pzp-pc-ui-button audio-compressor-button"
      data-active="false"
      onClick={onClickHandler}
    >
      <span className="pzp-pc-ui-button__tooltip pzp-pc-ui-button__tooltip--top">
        오디오 압축
      </span>
      <span className="pzp-ui-icon pzp-pc-setting-button__icon czp-pc-fast-button">
        {acActive ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 11V13M6 11V13M9 11V13M12 10V14M15 11V13M18 11V13M21 11V13"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
