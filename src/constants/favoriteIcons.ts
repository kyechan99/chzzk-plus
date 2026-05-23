/**
 * 즐겨찾기 그룹에서 사용할 미리 정의된 아이콘 세트.
 * 새 아이콘 추가 시: 이 배열에만 추가하면 됨. id 는 변경 금지 (저장된 그룹 데이터의 참조 키).
 * SVG path 는 tabler-icons (https://tabler.io/icons) 기반.
 */

export type FavoriteIconId =
  | 'star'
  | 'heart'
  | 'gamepad'
  | 'music'
  | 'mic'
  | 'movie'
  | 'flame'
  | 'moon';

export interface FavoriteIconDef {
  id: FavoriteIconId;
  label: string;
  /** viewBox 24 24 기준의 path 묶음. fill 속성은 currentColor 사용. */
  path: string;
}

export const FAVORITE_ICONS: FavoriteIconDef[] = [
  {
    id: 'star',
    label: '별',
    path: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z',
  },
  {
    id: 'heart',
    label: '하트',
    path: 'M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572',
  },
  {
    id: 'gamepad',
    label: '게임',
    path: 'M2 12a5 5 0 0 1 5 -5h10a5 5 0 0 1 5 5v0a5 5 0 0 1 -5 5h-10a5 5 0 0 1 -5 -5z M6 10v4 M8 12h-4 M15 11l0 .01 M18 13l0 .01',
  },
  {
    id: 'music',
    label: '음악',
    path: 'M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0 M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0 M9 17v-13h10v13 M9 8h10',
  },
  {
    id: 'mic',
    label: '마이크',
    path: 'M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z M5 10a7 7 0 0 0 14 0 M8 21l8 0 M12 17l0 4',
  },
  {
    id: 'movie',
    label: '영화',
    path: 'M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z M8 4l0 16 M16 4l0 16 M4 8l4 0 M4 16l4 0 M4 12l16 0 M16 8l4 0 M16 16l4 0',
  },
  {
    id: 'flame',
    label: '불꽃',
    path: 'M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z',
  },
  {
    id: 'moon',
    label: '달',
    path: 'M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z',
  },
];

export const DEFAULT_ICON_ID: FavoriteIconId = 'star';

export const findIcon = (id: string | undefined | null): FavoriteIconDef => {
  return FAVORITE_ICONS.find(i => i.id === id) ?? FAVORITE_ICONS[0];
};

/**
 * 그룹 색상 팔레트. 모두 흰 글씨/아이콘과 적정 대비를 갖는 톤으로 선별.
 * 새 색상 추가는 가능. 단 기존 그룹의 저장된 hex 값은 변경 금지 (저장된 데이터는 hex 그대로 보관).
 */
export const FAVORITE_COLORS: string[] = [
  '#20c997', // teal (기본)
  '#fa5252', // red
  '#fd7e14', // orange
  '#fab005', // yellow
  '#51cf66', // green
  '#339af0', // blue
  '#845ef7', // violet
  '#f06595', // pink
];

export const DEFAULT_COLOR: string = FAVORITE_COLORS[0];

/**
 * 저장된 색상이 유효한 hex 인지 검증. 잘못된 값이면 기본값으로 폴백.
 */
export const normalizeColor = (color: string | undefined | null): string => {
  if (typeof color !== 'string') return DEFAULT_COLOR;
  // #rgb / #rrggbb 만 허용
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return color;
  return DEFAULT_COLOR;
};
