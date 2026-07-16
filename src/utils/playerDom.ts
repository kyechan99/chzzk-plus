import { VIDEO_BUTTONS, WEBPLAYER_VIDEO } from '../constants/class';

export const findPlayerButtonList = (): HTMLElement | null => {
  const legacy = document.querySelector<HTMLElement>(VIDEO_BUTTONS);
  if (legacy) return legacy;

  const video = document.querySelector<HTMLVideoElement>(WEBPLAYER_VIDEO);
  const searchRoot = video?.closest<HTMLElement>('[id*="player"], [class*="player"], main') ?? document.body;

  const candidates = Array.from(searchRoot.querySelectorAll<HTMLElement>('button'))
    .map(button => button.parentElement)
    .filter((element): element is HTMLElement => !!element)
    .filter((element, index, array) => array.indexOf(element) === index)
    .filter(element => element.querySelectorAll('button').length >= 2)
    .filter(element => {
      const rect = element.getBoundingClientRect();
      const videoRect = video?.getBoundingClientRect();
      if (!videoRect) return true;
      return rect.top >= videoRect.top && rect.bottom <= videoRect.bottom + 80;
    })
    .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);

  return candidates[0] ?? null;
};
