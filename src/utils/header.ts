import { SECTION_TOOLBAR } from '../constants/class';

const getDepth = (element: Element): number => {
  let depth = 0;
  let current = element.parentElement;
  while (current) {
    depth += 1;
    current = current.parentElement;
  }
  return depth;
};

const getHeader = (): HTMLElement | null => {
  return document.querySelector<HTMLElement>('#header, header[aria-label], header');
};

const getButtonCount = (element: Element): number => {
  return element.querySelectorAll('button').length;
};

export const findHeaderToolbar = (): HTMLElement | null => {
  const header = getHeader();
  if (!header) return document.querySelector<HTMLElement>(SECTION_TOOLBAR);

  const semanticToolbar = header.querySelector<HTMLElement>(
    ':scope [class*="_section_"]:has(button), :scope [class*="toolbar_section__"]:has(button)',
  );
  if (semanticToolbar) return semanticToolbar;

  const directChild = Array.from(header.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .reverse()
    .find(child => getButtonCount(child) > 0);
  if (directChild) return directChild;

  const candidates = Array.from(header.querySelectorAll<HTMLElement>('div, section, nav'))
    .filter(element => getButtonCount(element) > 0)
    .sort((a, b) => getDepth(b) - getDepth(a));

  return candidates[0] ?? header;
};
