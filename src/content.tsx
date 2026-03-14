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

const waitingSPALoaded = setInterval(() => {
  const isBodyLoaded = !!document.body;
  const $layout = document.querySelector(LAYOUT_WRAP);

  if (isBodyLoaded && $layout !== null) {
    applyPageEdits();

    installRouteChangeObserver();

    clearInterval(waitingSPALoaded);
  }
}, 500);
