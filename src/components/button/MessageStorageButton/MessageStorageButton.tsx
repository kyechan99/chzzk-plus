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
        style={{ marginLeft: "0px", color: "#2cbf8a" }}
        onClick={onClickHandler}
      >
        저장소
      </button>
    </>
  );
}
