import { editLivePage } from './page/live';
import { editVideoPage } from './page/video';
import { editGlobalPage } from './page/global';

import { LAYOUT_WRAP } from './constants/class';
import { editLiveListPage } from './page/lives';
import { editCategoryPage } from './page/category';

const applyPageEdits = () => {
  editGlobalPage();
  editLivePage();
  editLiveListPage();
  editCategoryPage();
  editVideoPage();
};

const installRouteChangeObserver = () => {
  let lastUrl = location.href;
  let delayedEditTimer: number | null = null;

  const handleRouteChange = () => {
    if (location.href === lastUrl) {
      return;
    }

    lastUrl = location.href;
    applyPageEdits();

    if (delayedEditTimer !== null) {
      window.clearTimeout(delayedEditTimer);
    }

    delayedEditTimer = window.setTimeout(() => {
      applyPageEdits();
      delayedEditTimer = null;
    }, 300);
  };

  const originalPushState = history.pushState;
  history.pushState = function (...args: Parameters<History['pushState']>) {
    const result = originalPushState.apply(this, args);
    window.setTimeout(handleRouteChange, 0);
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args: Parameters<History['replaceState']>) {
    const result = originalReplaceState.apply(this, args);
    window.setTimeout(handleRouteChange, 0);
    return result;
  };

  window.addEventListener('popstate', handleRouteChange);
  window.addEventListener('hashchange', handleRouteChange);

  const pageChangeOb = new MutationObserver(() => {
    handleRouteChange();
  });

  pageChangeOb.observe(document, { subtree: true, childList: true });
};

/**
 * $layout 요소의 직계 자식들의 style 속성 변경을 감지하는 옵저버를 설치합니다.
 * [T] 키를 눌러 live 방송에서 탭 값이 변경된다거나 할때를 감지하기 위함
 * @param {HTMLElement} $layout - 감지 대상이 될 부모 레이아웃 요소
 */
function installChildStyleObserver($layout: HTMLElement) {
  if (!$layout) return;

  const childStyleObserver = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      // 1. 속성(attribute) 변경인지 확인
      // 2. 변경된 대상(target)의 부모가 $layout인지 확인 (직계 자식 조건)
      if (mutation.type === 'attributes' && mutation.target.parentElement === $layout) {
        console.log('asdfsadfasdfasfasdfasdfaf');
        applyPageEdits();
        break; // 한 턴에 여러 자식이 변경되어도 applyPageEdits는 한 번만 호출
      }
    }
  });

  // 옵저버 시작
  childStyleObserver.observe($layout, {
    childList: true, // 자식 노드의 추가/제거 감지 (자식의 속성을 보려면 필요)
    attributes: true, // 속성 변경 감지
    attributeFilter: ['style'], // 오직 'style' 속성만 타겟팅 (성능 최적화)
    subtree: true, // 하위 자식층까지 관찰 규칙 확장 (filter와 결합하여 직계 자식 스타일 포착)
  });
}

const waitingSPALoaded = setInterval(() => {
  const isBodyLoaded = !!document.body;
  const $layout = document.getElementById(LAYOUT_WRAP);

  if (isBodyLoaded && $layout !== null) {
    applyPageEdits();

    installRouteChangeObserver();

    installChildStyleObserver($layout);

    clearInterval(waitingSPALoaded);
  }
}, 500);
