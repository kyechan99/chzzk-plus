import React from "react";
import ReactDOM from "react-dom/client";

export const createReactElement = (
  root: Element,
  element: () => JSX.Element
) => {
  ReactDOM.createRoot(root).render(React.createElement(element));
};

export async function waitingElement(selector: string): Promise<HTMLElement> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return await new Promise((resolve, _reject) => {
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element !== null) {
        clearInterval(interval);
        resolve(element as HTMLElement);
      }
    }, 500);
  });
}
