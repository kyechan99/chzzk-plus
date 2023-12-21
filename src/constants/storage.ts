/*******************************************
 *
 * 크롬 Storage 관리
 *
 *******************************************/

// 비디오 플레이어 보호 모드
export const BARRICADE = "barricade";

// 채팅 색상 옵션
export const CHAT_COLOR_THEME = "chat-color-theme";
export const CHAT_COLOR_OPTIONS: CHAT_COLOR_OPTION_TYPE[] = [
  "기본",
  "테마",
  "커스텀",
];
export type CHAT_COLOR_OPTION_TYPE = "기본" | "테마" | "커스텀";
export const CHAT_NAME_COLOR = "czp-chat-name";
export const CHAT_TEXT_COLOR = "czp-chat-text";
export const COLOR_PROPERTIES = [CHAT_NAME_COLOR, CHAT_TEXT_COLOR];

export const CHEEZE_REMOVER = "czp-cheeze-remover"; // 치즈 제거 여부
