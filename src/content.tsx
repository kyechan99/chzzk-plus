import { editLivePage } from "./page/live";
import { editVideoPage } from "./page/video";
import { editGlobalPage } from "./page/global";

import { LAYOUT_WRAP } from "./constants/class";
import { editLiveListPage } from "./page/lives";

const waitingSPALoaded = setInterval(() => {
  const isBodyLoaded = !!document.body;
  const $layout = document.querySelector(LAYOUT_WRAP);

  if (isBodyLoaded && $layout !== null) {
    /**
     * 페이지 content 수정
     */
    editGlobalPage();
    editLivePage();
    editLiveListPage();
    editVideoPage();

    /**
     * [주의]
     * URL이 변경되었지만 JS로 DOM이 변하는 페이지 이동의 경우가 있음
     * /live 페이지에 editLivePage()를 호출하는 것 처럼 global 이 아닌 상황에는 이에 맞게 재호출 해줘야함
     * 중복되어 event나 element를 추가할 수 있으니 id 확인 등으로 재생성 방지해야함
     */
    const pageChangeOb = new MutationObserver(() => {
      editGlobalPage();
      editLivePage();
      editLiveListPage();
      editVideoPage();
    });
    pageChangeOb.observe(document.head, { subtree: true, childList: true });

    /**
     * [주의]
     * Screen 의 크기를 조절하면 기존의 DOM 이 수정됨. 따라서 다시 그려줘야함
     * 중복되어 event나 element를 추가할 수 있으니 id 확인 등으로 재생성 방지해야함
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const screenChangeOb = new MutationObserver((mutationsList) => {
    //   for (const mutation of mutationsList) {
    //     const addedNodes = mutation.addedNodes;
    //     if (addedNodes.length > 0) {
    //       // if (mutationsList.length > 0) {
    //       editGlobalPage();
    //       editLivePage();
    //       editLiveListPage();
    //       editVideoPage();
    //       break;
    //     }
    //   }
    // });
    // screenChangeOb.observe($layout, {
    //   subtree: false,
    //   childList: true,
    // });

    clearInterval(waitingSPALoaded);
  }
}, 500);
