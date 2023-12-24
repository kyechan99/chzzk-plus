import "./AudioCompressorButton.css";

export default function AudioCompressorButton() {
  const video = document.getElementsByTagName("video")[0];
  let audioCtx: AudioContext;
  let source: MediaElementAudioSourceNode;
  let compressor: DynamicsCompressorNode;

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const button = e.currentTarget;
    const active = button.getAttribute("data-active");

    if(!audioCtx) {
      audioCtx = new AudioContext();

      source = audioCtx.createMediaElementSource(video);
      compressor = audioCtx.createDynamicsCompressor();

      compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
      compressor.knee.setValueAtTime(40, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      source.connect(audioCtx.destination);
    }

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
    <button className="audio-compressor-button" data-active='false' onClick={onClickHandler}>
      Add compression
    </button>
  );
}
