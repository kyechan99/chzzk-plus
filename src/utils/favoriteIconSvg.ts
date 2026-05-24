import { findIcon } from '../constants/favoriteIcons';

/**
 * React 외부(DOM 직접 조작) 컨텍스트에서 즐겨찾기 아이콘을 그릴 때 사용.
 * feature/favorite.ts 의 nav 배지 주입처럼 비-React 컨텍스트에서 활용.
 */
export const renderFavoriteIconSvg = (iconId: string, size = 12): string => {
  const def = findIcon(iconId);
  const isFilled = def.id === 'star' || def.id === 'heart' || def.id === 'flame' || def.id === 'moon';
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="${isFilled ? 'currentColor' : 'none'}" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="${def.path}" />
    </svg>
  `.trim();
};
