import { findIcon, FavoriteIconId } from '../../constants/favoriteIcons';

interface FavoriteIconProps {
  id: FavoriteIconId | string | undefined;
  size?: number;
}

/**
 * 즐겨찾기 아이콘 SVG 렌더러.
 * id 가 알 수 없거나 비어있으면 첫번째 아이콘(star)으로 폴백.
 */
export default function FavoriteIcon({ id, size = 16 }: FavoriteIconProps) {
  const def = findIcon(id);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={def.id === 'star' || def.id === 'heart' || def.id === 'flame' || def.id === 'moon' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d={def.path} />
    </svg>
  );
}
