import React from "react";
import ReactDOM from "react-dom/client";

export const createReactElement = (
  root: Element,
  element: () => JSX.Element
) => {
  ReactDOM.createRoot(root).render(React.createElement(element));
};

export async function waitingElement(
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement | null> {
  const startTime = Date.now();
  while (document.querySelector(selector) === null) {
    // 타임아웃
    if (Date.now() - startTime >= timeout) {
      return null;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return document.querySelector(selector) as HTMLElement;
}
