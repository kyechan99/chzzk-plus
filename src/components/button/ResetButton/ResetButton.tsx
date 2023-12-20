import "./ResetButton.css";

export default function ResetButton({ id }: { id: string }) {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    chrome.storage.local.remove(id, () => {});
  };

  return (
    <button className="reset-button" onClick={onClickHandler}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-rotate"
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
        <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
      </svg>
    </button>
  );
}
