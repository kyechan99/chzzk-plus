import React from 'react';
import ReactDOM from 'react-dom/client';

// 같은 컨테이너에 React root 가 중복 생성되는 것을 방지 (라우팅 재적용 시 경고/메모리 누수 방지)
const mountedRoots = new WeakSet<Element>();

export const createReactElement = (root: Element, element: () => JSX.Element) => {
  if (mountedRoots.has(root)) return;
  mountedRoots.add(root);
  ReactDOM.createRoot(root).render(React.createElement(element));
};

/**
 * selector 에 해당하는 엘리먼트가 나타날 때까지 기다린다.
 *
 * 기존에는 requestAnimationFrame 루프로 매 프레임마다 querySelector 를 호출했지만,
 * 이제 MutationObserver 로 "DOM 이 실제로 변할 때만" 재검사한다.
 *  - 이미 존재하면 즉시 resolve (불필요한 지연 제거)
 *  - 매 프레임 폴링이 아니라 mutation 발생 시에만 검사 → CPU 효율 + 등장 즉시 반응
 *  - timeout 초과 시 null
 */
export function waitingElement(selector: string, timeout: number = 5000): Promise<HTMLElement | null> {
  const existing = document.querySelector<HTMLElement>(selector);
  if (existing) return Promise.resolve(existing);

  return new Promise(resolve => {
    let settled = false;

    const finish = (el: HTMLElement | null) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timer);
      resolve(el);
    };

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) finish(el);
    });

    const timer = window.setTimeout(() => finish(null), timeout);

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // observe 설정 직전에 등장했을 가능성에 대비해 한 번 더 확인
    const late = document.querySelector<HTMLElement>(selector);
    if (late) finish(late);
  });
}

/**
 * 키보드 단축키 처리 시, 사용자가 입력창에 타이핑 중인지 판단한다.
 * 기존에는 난독화된 input 클래스명 목록과 비교했지만, 클래스가 바뀌면 깨지므로
 * 엘리먼트 종류(input/textarea/select/contenteditable)로 견고하게 판단한다.
 */
export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

/**
 * 실제 마우스 조작과 동일한 mousedown → mouseup 시퀀스를 디스패치한다.
 * (withClick=true 를 넘기면 click 이벤트까지 함께 디스패치)
 * 치지직 UI 중 일부(이모티콘 팩 탭, 채팅 입력창 포커스 등)는 click 이 아니라
 * mousedown/mouseup 에 핸들러가 걸려 있어 el.click() 만으로는 동작하지 않는다.
 */
export const dispatchMouseClickSequence = ($el: HTMLElement, withClick: boolean = false): void => {
  const base = { bubbles: true, cancelable: true, view: window, button: 0 };
  $el.dispatchEvent(new MouseEvent('mousedown', { ...base, buttons: 1 }));
  $el.dispatchEvent(new MouseEvent('mouseup', { ...base, buttons: 0 }));
  if (withClick) $el.dispatchEvent(new MouseEvent('click', { ...base, buttons: 0 }));
};

export const getElementText = (element: Element): string => {
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
};

export const hasClassPrefix = (element: Element, classPrefix: string): boolean => {
  return Array.from(element.classList).some(className => className.startsWith(classPrefix));
};

export const findClosestByClassPrefixWithChildTexts = ({
  childSelector,
  classPrefix,
  texts,
}: {
  childSelector: string;
  classPrefix: string;
  texts: string[];
}): Element | null => {
  const matchingChildren = Array.from(document.querySelectorAll(childSelector)).filter(child => {
    const childText = getElementText(child);
    return texts.some(text => childText.includes(text));
  });

  for (const child of matchingChildren) {
    const parent = child.closest(`[class*="${classPrefix}"]`);
    if (!parent || !hasClassPrefix(parent, classPrefix)) continue;

    const hasAllTexts = texts.every(text => {
      return Array.from(parent.querySelectorAll(childSelector)).some(child => getElementText(child).includes(text));
    });

    if (hasAllTexts) return parent;
  }

  return null;
};
