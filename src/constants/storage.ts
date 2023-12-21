/*******************************************
 *
 * 크롬 Storage 관리
 *
 *******************************************/

// 비디오 플레이어 보호 모드
export const BARRICADE = "barricade";
export const PLAYER_KEY_CONTROL = "czp-player-key";

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
export const CHAT_SIZE = "czp-chat-size";
export const CHAT_SIZE_OPTIONS = [
  "기본(14)",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];
export const CHEEZE_REMOVER = "czp-cheeze-remover"; // 치즈 제거 여부

// 즐겨찾기한 스트리머
export const FAVORITE_STREAMER = "czp-favorite-streamer";
