import Preview from "../components/video/Preview/Preview";

import { log } from "../utils/log";
import { createReactElement } from "../utils/dom";

export const editGlobalPage = () => {
  // Feat: Preview 썸네일 =====================================================================
  const $preview = document.createElement("div");
  $preview.id = "chzzk-plus-preview";
  document.body.appendChild($preview);
  createReactElement($preview, Preview);

  log("GLOBAL PAGE 설정");
};
