import React from "react";
import ReactDOM from "react-dom/client";

export const createReactElement = (
  root: Element,
  element: () => JSX.Element
) => {
  ReactDOM.createRoot(root).render(React.createElement(element));
};
