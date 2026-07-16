import { logWarning } from '../utils/log';
import { hasBlockedMarker } from '../utils/videoList';

export const blockSetting = (cardList: Element) => {
  Array.from(cardList.children).forEach(node => {
    if (hasBlockedMarker(node)) {
      node.remove();
    }
  });

  try {
    const observer = new MutationObserver(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (mutationList, _observer) => {
        for (const mutation of mutationList) {
          for (const addedNode of mutation.addedNodes as NodeListOf<HTMLElement>) {
            if (hasBlockedMarker(addedNode)) {
              addedNode.remove();
            }
          }
        }
      },
    );

    observer.observe(cardList, {
      childList: true,
      subtree: true,
    });
  } catch (err) {
    logWarning(err);
  }
};
