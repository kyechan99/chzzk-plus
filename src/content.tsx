import { editLivePage } from './page/live';
import { editVideoPage } from './page/video';
import { editGlobalPage } from './page/global';

import { LAYOUT_WRAP } from './constants/class';
import { editLiveListPage } from './page/lives';
import { editCategoryPage } from './page/category';
import { waitingElement } from './utils/dom';
import { initVideoFilter } from './feature/videoFilter';
import { initLiveNewTab } from './feature/liveNewTab';
import { initFollowNotify } from './feature/followNotify';
import { initTabViewerCount } from './feature/tabViewerCount';

/**
 * MAIN world(페이지 컨텍스트)에서 동작하는 inject.js 를 주입한다.
 * content script(ISOLATED world)는 React 내부(__reactFiber$ 등)에 접근할 수 없으므로,
 * fiber 를 읽어 data-czp-* 속성을 찍어주는 스크립트를 페이지에 직접 삽입한다.
 */
const injectMainWorldScript = () => {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  } catch {
    // 주입 실패해도 클래스 기반 폴백으로 동작하므로 무시
  }
};

const applyPageEdits = () => {
  editGlobalPage();
  editLivePage();
  editLiveListPage();
  editCategoryPage();
  editVideoPage();
};

/**
 * 재조정(reconcile): "이유 불문, 우리 UI 가 사라졌으면 다시 붙인다".
 *
 * 치지직은 넓은 화면 / 전체 화면 / 채팅 끄기 등으로 URL 변경 없이 DOM 을 통째로 재구성한다.
 * 그때마다 우리가 주입한 버튼/프리뷰가 함께 제거되므로, 다시 그려질 때 재부착해야 한다.
 * applyPageEdits 는 각 feature 가 idempotent(중복 생성 가드) 하므로 몇 번을 불러도 안전하다.
 *
 * 단, 호출 폭주를 막기 위해 throttle 한다. (구조 변경이 한꺼번에 쏟아져도 묶어서 1회 처리)
 */
const RECONCILE_THROTTLE = 250;
let lastReconcileAt = 0;
let reconcileTimer: number | null = null;

const reconcile = () => {
  lastReconcileAt = Date.now();
  applyPageEdits();
};

const scheduleReconcile = () => {
  const elapsed = Date.now() - lastReconcileAt;
  if (elapsed >= RECONCILE_THROTTLE) {
    reconcile();
  } else if (reconcileTimer === null) {
    reconcileTimer = window.setTimeout(() => {
      reconcileTimer = null;
      reconcile();
    }, RECONCILE_THROTTLE - elapsed);
  }
};

const installRouteChangeObserver = () => {
  let lastUrl = location.href;

  const handleRouteChange = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    // 새 페이지 DOM 은 시간차로 그려지지만, self-healing 옵저버가 등장하는 대로 잡아준다.
    scheduleReconcile();
  };

  // 치지직은 React Router(history API) 로 페이지를 전환하므로 pushState/replaceState 후킹으로
  // SPA 내비게이션을 잡는다.
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
};

/**
 * self-healing 옵저버: $layout 하위에서 노드가 추가/제거될 때마다 재조정을 예약한다.
 * 이것이 넓은화면/전체화면/채팅끄기처럼 URL 없이 일어나는 DOM 재구성에 대한 핵심 대응이다.
 *
 * 채팅 메시지 스트림([role="log"]) 내부 변경은 초당 수십 건이라 무시한다.
 * (우리 UI 마운트 지점은 헤더 툴바/사이드바/플레이어/채팅 도구 등 로그 바깥에 있다)
 */
function installSelfHealingObserver($layout: HTMLElement) {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      const target = mutation.target;
      if (target instanceof Element && target.closest('[role="log"]')) continue;
      scheduleReconcile();
      return;
    }
  });

  observer.observe($layout, { childList: true, subtree: true });
}

/**
 * $layout 직계 자식의 style 속성 변경 감지.
 * [T] 키로 live 방송 탭이 전환될 때 등을 잡기 위함 (좁은 범위만 관찰).
 */
function installChildStyleObserver($layout: HTMLElement) {
  const childStyleObserver = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.target.parentElement === $layout) {
        scheduleReconcile();
        break;
      }
    }
  });

  childStyleObserver.observe($layout, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true,
  });
}

// 진입점: 레이아웃이 그려질 때까지 기다린 뒤(폴링 대신 MutationObserver 기반) 기능을 주입한다.
(async () => {
  injectMainWorldScript();
  initVideoFilter();
  initLiveNewTab();
  initFollowNotify();
  initTabViewerCount();

  const $layout = await waitingElement(`#${LAYOUT_WRAP}`, 30000);
  if (!$layout) return;

  applyPageEdits();
  installRouteChangeObserver();
  installSelfHealingObserver($layout);
  installChildStyleObserver($layout);
})();
