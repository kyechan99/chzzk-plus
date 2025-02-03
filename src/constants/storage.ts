/*******************************************
 *
 * 크롬 Storage 관리
 *
 *******************************************/

export const GLOBAL_SETTING = "czp-global-setting";

// 네비게이터 갱신 모드
export const FOLLOWING_REFRESH_ENABLE = "czp-following-refresh";

// 비디오 플레이어 보호 모드
export const BARRICADE = "barricade";

export const FAST_BUTTON = "czp-fast-btn";
export const PIP_BUTTON = "czp-pip-btn";
export const AUDIO_COMPRESSOR = "czp-compressor-btn";

// 채팅 색상 옵션
export const CHAT_COLOR_THEME = "chat-color-theme";
export const CHAT_COLOR_OPTIONS: CHAT_COLOR_OPTION_TYPE[] = [
  "기본",
  // "테마",
  "커스텀",
];
export type CHAT_COLOR_OPTION_TYPE = "기본" | "커스텀";
export const CHAT_NAME_COLOR = "czp-chat-name";
export const CHAT_TEXT_COLOR = "czp-chat-text";
export const COLOR_PROPERTIES = [CHAT_NAME_COLOR, CHAT_TEXT_COLOR];
export const CHAT_SIZE = "czp-chat-size";
export const CHAT_SIZE_OPTIONS = [
  "11",
  "12",
  "13",
  "기본(14)",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
];
export const CHEEZE_REMOVER = "czp-cheeze-remover"; // 치즈 제거 여부
export const BLIND_REMOVER = "czp-blind-remover"; // 블라인드 챗 제거 여부
export const SUBSCRIBE_REMOVER = "czp-subscribe-remover"; // 구독 챗 제거 여부
export const CHEEZE_RANKING_REMOVER = "czp-cheeze-ranking-remover"; // 주간 후원 랭킹 제거 여부

// 미리보기
export const PREVIEW_ENABLE = "czp-preview-enable";

// 즐겨찾기한 스트리머
export const FAVORITE_STREAMER = "czp-favorite-streamer";

// 채팅 저장소
export const CHAT_STORAGE = "czp-chat-storage";

// 생방송 새로고침
export const ONLIVE_REFRESH = "czp-live-refresh";

// 차단 방송
export const BLOCKED_STREAMER = "czp-blocked-card";

// 기록 (녹화, 캡처)
export const RECORD_ENABLE = "czp-record-enable";

// 자동 넓은 화면
export const AUTO_WIDE_MODE = "czp-auto-wide";

// 메시지 고정 유저 리스트
export const MESSAGE_PIN_USERS = "czp-message-pin-users";

// 메시지 고정 여부
export const MESSAGE_PIN_ENABLE = "czp-message-pin-enable";

// 화면 보호기
export const GUARD_ENALBE = "czp-guard-enable";
