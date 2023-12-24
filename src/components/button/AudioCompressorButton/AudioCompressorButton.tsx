import "./AudioCompressorButton.css";

export default function AudioCompressorButton() {
  const video = document.getElementsByTagName("video")[0];

  let audioCtx: AudioContext;
  let source: MediaElementAudioSourceNode;
  let compressor: DynamicsCompressorNode;

  video.addEventListener('play', () => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
      source = audioCtx.createMediaElementSource(video);
      compressor = audioCtx.createDynamicsCompressor();
      source.connect(compressor);
      compressor.connect(audioCtx.destination);
    }
  });

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const button = e.currentTarget;
    const active = button.getAttribute("data-active");

    if (active === "false") {
      button.setAttribute("data-active", "true");
      button.textContent = "Remove compression";

      source.disconnect(audioCtx.destination);
      source.connect(compressor);
      compressor.connect(audioCtx.destination);
    } else if (active === "true") {
      button.setAttribute("data-active", "false");
      button.textContent = "Add compression";

      source.disconnect(compressor);
      compressor.disconnect(audioCtx.destination);
      source.connect(audioCtx.destination);
    }
  };

  return (
    <button className="audio-compressor-button" onClick={onClickHandler}>
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-pin-invoke"
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
        <path d="M21 13v5a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-12a1 1 0 0 1 1 -1h9" />
        <path d="M19 7m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M10 11h4v4" />
        <path d="M10 15l4 -4" />
      </svg> */}
    </button>
  );
}
