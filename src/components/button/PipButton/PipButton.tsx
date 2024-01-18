// import "./PipButton.css";

export default function PipButton() {
  const video = document.getElementsByTagName("video")[0];
  video.disablePictureInPicture = false;

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (video) {
      video.requestPictureInPicture();
    }
  };

  return (
    <button
      aria-label="PIP"
      className="pzp-button pzp-pc-setting-button pzp-pc__setting-button pzp-pc-ui-button pip-button"
      data-active="false"
      onClick={onClickHandler}
    >
      <span className="pzp-pc-ui-button__tooltip pzp-pc-ui-button__tooltip--top">
        PIP
      </span>
      <span className="pzp-ui-icon pzp-pc-setting-button__icon czp-pc-fast-button">
        <svg
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
        </svg>
      </span>
    </button>
  );
}
