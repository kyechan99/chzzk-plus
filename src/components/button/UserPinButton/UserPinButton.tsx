import { useState, useEffect } from "react";
import { USER_POPUP_NAME } from "../../../constants/class";
import { MESSAGE_PIN_USERS } from "../../../constants/storage";
import { waitingElement } from "../../../utils/dom";

export default function UserPinButton() {
  const [isPinned, setIsPinned] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    waitingElement(USER_POPUP_NAME).then((userNameElement) => {
      if (userNameElement?.textContent) {
        setUserName(userNameElement.textContent);
        chrome.storage.local.get([MESSAGE_PIN_USERS], (res) => {
          const pinnedUsers = res[MESSAGE_PIN_USERS] || [];
          setIsPinned(pinnedUsers.includes(userNameElement.textContent));
        });
      }
    });
    return () => {
      setUserName("");
      setIsPinned(false);
    };
  }, []);

  const handlerClick = () => {
    if (!userName) return;

    chrome.storage.local.get([MESSAGE_PIN_USERS], (res) => {
      const pinnedUsers = res[MESSAGE_PIN_USERS] || [];
      let newPinnedUsers: string[];

      if (isPinned) {
        newPinnedUsers = pinnedUsers.filter(
          (user: string) => user !== userName
        );
      } else {
        newPinnedUsers = [...pinnedUsers, userName];
      }

      chrome.storage.local.set(
        {
          [MESSAGE_PIN_USERS]: newPinnedUsers,
        },
        () => {
          setIsPinned((prev) => !prev);
        }
      );
    });
  };

  if (!userName) return <></>;

  return (
    <button
      onClick={handlerClick}
      className="live_chatting_popup_profile_item__tOguB"
      id="chzzk-plus-user-pin-btn"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        className="live_chatting_fixed_icon_pin__jecmM"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="m11.18 4.207.024.272-.01-.01-1.916 1.924A1.595 1.595 0 0 0 9 6.387l-2.356.156A.602.602 0 0 0 6.26 7.57l4.223 4.242.007.006.465.467a.598.598 0 0 0 1.021-.397l.03-.66.001-.009.082-1.761c.002-.04.003-.081.002-.121l1.974-1.984-.01-.01.27.023.25.022a.3.3 0 0 0 .238-.512l-.178-.179-.625-.628-.019-.019-.183-.184-1.133-1.138-.184-.185-.018-.018-.625-.628-.178-.179a.3.3 0 0 0-.51.239l.022.251Z"
          clipRule="evenodd"
        ></path>
        <path
          fill="currentColor"
          d="m11.204 4.48-.353.353.969.973-.119-1.37-.497.043Zm-.023-.273.497-.043-.497.043Zm.013.262.352-.355-.352-.354-.353.354.353.355ZM9.278 6.393l-.054.498.238.026.17-.17-.354-.354ZM9 6.387l.033.5-.033-.5Zm-2.356.156.033.5-.033-.5Zm5.332 5.344-.498-.023.498.023Zm.03-.66-.498-.023.499.023Zm.001-.009.499.024v-.004l-.499-.02Zm0 0-.498-.023v.004l.498.02Zm.082-1.761.499.023-.499-.023Zm.002-.121-.353-.355-.152.153.006.216.498-.014Zm1.974-1.984.353.354.353-.354-.353-.354-.353.354Zm-.01-.01.043-.5-1.365-.12.969.974.352-.355Zm.27.023.043-.5-.043.5Zm.25.022-.043.5.043-.5ZM11.16 3.956l-.497.043.497-.043Zm.542.48-.023-.272-.994.087.023.272.994-.087Zm-.86.387.01.01.706-.708-.01-.01-.706.708Zm-1.21 1.924 1.915-1.924-.705-.709-1.915 1.924.705.709Zm-.299-.853a2.091 2.091 0 0 0-.366-.007l.066 1c.065-.005.13-.003.192.004l.108-.997Zm-.366-.007-2.356.156.066 1 2.356-.156-.066-1Zm-2.356.156c-.941.063-1.37 1.21-.703 1.88l.705-.709a.1.1 0 0 1 .064-.17l-.066-1Zm-.703 1.88 4.222 4.242.706-.709-4.223-4.242-.705.71Zm4.222 4.242.706-.709-.706.709Zm0 0 .007.007.705-.71-.006-.006-.706.709Zm.007.007.465.466.705-.708-.465-.467-.705.709Zm.465.466c.674.678 1.828.229 1.872-.727l-.996-.047a.095.095 0 0 1-.018.055.106.106 0 0 1-.046.033.104.104 0 0 1-.056.007.093.093 0 0 1-.05-.03l-.706.71Zm1.872-.727.031-.66-.996-.047-.031.66.996.046Zm.031-.66v-.01l-.996-.046v.009l.996.047Zm0-.013-.996-.04.997.04Zm0 .004.083-1.762-.997-.047-.082 1.762.997.046Zm.083-1.762c.002-.053.003-.106.001-.158l-.997.028v.083l.996.047Zm1.124-2.482L11.737 8.98l.705.71 1.975-1.985-.706-.708Zm-.01.698.01.01.706-.708-.01-.011-.706.709Zm.666-.83-.27-.024-.087.998.27.024.087-.998Zm.25.022-.25-.022-.086.998.25.022.087-.998Zm-.158.341a.2.2 0 0 1 .159-.341l-.087.998c.742.065 1.16-.836.634-1.366l-.706.709Zm-.178-.179.178.179.706-.709-.178-.178-.706.708Zm-.625-.627.625.627.706-.708-.625-.628-.706.709Zm-.018-.02.018.02.706-.71-.019-.018-.705.709Zm-.184-.184.184.185.705-.71-.183-.183-.706.708Zm-1.133-1.138 1.133 1.138.706-.708-1.133-1.139-.706.71Zm-.183-.184.183.184.706-.709-.184-.184-.705.709Zm-.02-.02.02.02.705-.709-.019-.019-.705.709Zm-.624-.627.625.628.705-.709-.625-.628-.705.709Zm-.178-.179.178.179.705-.709-.178-.178-.705.708Zm.34-.159a.2.2 0 0 1-.34.16l.705-.71c-.526-.528-1.424-.108-1.36.637l.995-.087Zm.022.252-.022-.252-.994.087.022.252.994-.087Z"
        ></path>
        <path
          fill="currentColor"
          fillRule="evenodd"
          stroke="currentColor"
          strokeWidth="0.5"
          d="M6.674 11.13 7.5 12l-2.665 2.166c-.26.185-.578-.138-.394-.4l2.233-2.637Z"
          clipRule="evenodd"
        ></path>
      </svg>
      <span>{isPinned ? "유저 메시지 고정 해제" : "유저 메시지 고정"}</span>
    </button>
  );
}
