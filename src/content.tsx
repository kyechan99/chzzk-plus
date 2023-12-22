import { editGlobalPage } from "./page/global";
import { editLivePage } from "./page/live";
import { editVideoPage } from "./page/video";

const waitingSPALoaded = setInterval(() => {
  const isBodyLoaded = !!document.body;

  const $layout = document.querySelector(".layout_glive__oajiQ");

  if (isBodyLoaded && $layout !== null) {
    /**
     * 페이지 content 수정
     */
    editGlobalPage();
    editLivePage();
    editVideoPage();

    /**
     * [주의]
     * URL이 변경되었지만 JS로 DOM이 변하는 페이지 이동의 경우가 있음
     * /live 페이지에 editLivePage()를 호출하는 것 처럼 global 이 아닌 상황에는 이에 맞게 재호출 해줘야함
     * 중복되어 event나 element를 추가할 수 있으니 id 확인 등으로 재생성 방지해야함
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observer = new MutationObserver((_mutations) => {
      editLivePage();
      editVideoPage();
    });

    const config = { subtree: true, childList: true };
    observer.observe(document.head, config);

    clearInterval(waitingSPALoaded);
  }
}, 500);
