import "./FastButton.css";

export default function FastButton() {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const video = document.querySelector(
      ".webplayer-internal-video"
    ) as HTMLVideoElement;

    video.playbackRate = 2.0;
  };

  return (
    <button
      className="pzp-button pzp-pc-setting-button pzp-pc__setting-button pzp-pc-ui-button"
      aria-label="빨리감기"
      aria-haspopup="true"
      onClick={onClickHandler}
      //   command="SettingCommands.Toggle"
    >
      <span className="pzp-pc-ui-button__tooltip pzp-pc-ui-button__tooltip--top">
        빨리감기
      </span>
      <span className="pzp-ui-icon pzp-pc-setting-button__icon czp-pc-fast-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pzp-ui-icon__svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="#FFF"
          fill="#FFF"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
            stroke-width="0"
            fill="currentColor"
          />
          <path
            d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
            stroke-width="0"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}
