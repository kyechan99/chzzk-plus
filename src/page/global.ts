import { previewSetting } from "../feature/preview";
import { chatSetting } from "../feature/chat";
import Global from "../components/Global";

import { log } from "../utils/log";
import { createReactElement } from "../utils/dom";

export const editGlobalPage = () => {
  /**
   * 글로벌로 적용시킬만한 내용을 관리합니다.
   * 차후 페이지에 popup과 동일한 컴포넌트를 띄우는데 사용될 수 있어요.
   */
  if (!document.getElementById("chzzk-plus-global")) {
    const $global = document.createElement("div");
    $global.id = "chzzk-plus-global";
    document.body.appendChild($global);
    createReactElement($global, Global);
  }

  previewSetting();

  chatSetting();

  log("GLOBAL PAGE 설정");
};
