import { GLOBAL_SETTING } from "../../../constants/storage";

export default function MessageStorageButton() {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    chrome.storage.local.set({
      [GLOBAL_SETTING]: "true",
    });
  };

  return (
    <>
      <button
        type="button"
        id="chzzk-plus-strage-btn"
        className="live_chatting_input_send_button__8KBrn"
        style={{
          marginLeft: "5px",
          color: "#2cbf8a",
          fontFamily:
            "Sandoll Nemony2, Apple SD Gothic NEO, Helvetica Neue, Helvetica, 나눔고딕, NanumGothic, Malgun Gothic, 맑은 고딕, 굴림, gulim, 새굴림, noto sans, 돋움, Dotum, sans-serif",
        }}
        onClick={onClickHandler}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="24"
          height="24"
          strokeWidth="2"
        >
          <path d="M17 19h4"></path>
          <path d="M14 20h-8a3 3 0 0 1 0 -6h11a3 3 0 0 0 -3 3m7 -3v-8a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8"></path>
          <path d="M19 17v4"></path>
        </svg>
      </button>
    </>
  );
}
