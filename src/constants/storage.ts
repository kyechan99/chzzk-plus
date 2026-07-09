/*******************************************
 *
 * 크롬 Storage 관리
 *
 *******************************************/

export const MESSAGE_STORAGE_MODAL = 'czp-storage-modal';
export const SETTING_MODAL = 'czp-setting-modal';

// 네비게이터 갱신 모드
export const FOLLOWING_REFRESH_ENABLE = 'czp-following-refresh';

// 비디오 플레이어 보호 모드
export const BARRICADE = 'barricade';

export const FAST_BUTTON = 'czp-fast-btn';
export const PIP_BUTTON = 'czp-pip-btn';
export const AUDIO_COMPRESSOR = 'czp-compressor-btn';
export const AUDIO_COMPRESSOR_AUTO = 'czp-compressor-auto'; // 라이브 진입 시 컴프레서 자동 ON

// 채팅 색상 옵션
export const CHAT_COLOR_THEME = 'chat-color-theme';
export const CHAT_COLOR_OPTIONS: CHAT_COLOR_OPTION_TYPE[] = [
  '기본',
  // "테마",
  '커스텀',
];
export type CHAT_COLOR_OPTION_TYPE = '기본' | '커스텀';
export const CHAT_NAME_COLOR = 'czp-chat-name';
export const CHAT_TEXT_COLOR = 'czp-chat-text';
export const COLOR_PROPERTIES = [CHAT_NAME_COLOR, CHAT_TEXT_COLOR];
export const CHAT_SIZE = 'czp-chat-size';
export const CHAT_SIZE_OPTIONS = [
  '11',
  '12',
  '13',
  '기본(14)',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
];
export const CHEEZE_REMOVER = 'czp-cheeze-remover'; // 치즈 제거 여부
export const BLIND_REMOVER = 'czp-blind-remover'; // 블라인드 챗 제거 여부
export const SUBSCRIBE_REMOVER = 'czp-subscribe-remover'; // 구독 챗 제거 여부
export const CHAT_BADGE_REMOVER = 'czp-chat-badge-remover'; // 채팅 뱃지 제거 여부
export const CHEEZE_RANKING_REMOVER = 'czp-cheeze-ranking-remover'; // 주간 후원 랭킹 제거 여부

// 미리보기
export const PREVIEW_ENABLE = 'czp-preview-enable';
export const PREVIEW_VOLUME = 'czp-preview-volume'; // 프리뷰 볼륨 0~1 (기본 0=음소거)

// 즐겨찾기한 스트리머 (레거시: string[]. 읽을 때 그룹으로 자동 마이그레이션됨)
export const FAVORITE_STREAMER = 'czp-favorite-streamer';
// 즐겨찾기 기능 활성화 여부 (팔로우 채널 nav 최상단 정렬)
export const FAVORITE_ENABLE = 'czp-favorite-enable';
// 즐겨찾기 그룹 (단일 진실 공급원). 구조는 utils/favoriteStore.ts 참고.
export const FAVORITE_GROUPS = 'czp-favorite-groups';

// 채팅 저장소
export const CHAT_STORAGE = 'czp-chat-storage';
export const CHAT_STORAGE_ENABLE = 'czp-chat-storage-enable';

// 채팅 이모티콘
export const CHAT_EMOJI_SEARCH_ENABLE = 'czp-chat-emoji-search-enable';

// 생방송 새로고침
export const ONLIVE_REFRESH = 'czp-live-refresh';

// 차단 방송
export const BLOCKED_STREAMER = 'czp-blocked-card';

// 기록 (녹화, 캡처)
// export const RECORD_ENABLE = "czp-record-enable";

// 자동 넓은 화면
export const AUTO_WIDE_MODE = 'czp-auto-wide';

// 메시지 고정 유저 리스트
export const MESSAGE_PIN_USERS = 'czp-message-pin-users';

// 메시지 고정 여부
export const MESSAGE_PIN_ENABLE = 'czp-message-pin-enable';

// 화면 보호기
export const GUARD_ENALBE = 'czp-guard-enable';

// 비디오 필터 (SVG 필터로 영상에 적용). 기본값은 "효과 없음".
export const VIDEO_BRIGHTNESS = 'czp-video-brightness'; // 밝기 0~2 (기본 1)
export const VIDEO_CONTRAST = 'czp-video-contrast'; // 대비 0~2 (기본 1)
export const VIDEO_SATURATION = 'czp-video-saturation'; // 채도 0~3 (기본 1)
export const VIDEO_GAMMA = 'czp-video-gamma'; // 감마 0~3 (기본 1)
export const VIDEO_SHARPNESS = 'czp-video-sharpness'; // 선명도 0~10 (기본 0)

export const VIDEO_FILTER_KEYS = [VIDEO_BRIGHTNESS, VIDEO_CONTRAST, VIDEO_SATURATION, VIDEO_GAMMA, VIDEO_SHARPNESS];
export const VIDEO_FILTER_DEFAULTS: Record<string, number> = {
  [VIDEO_BRIGHTNESS]: 1,
  [VIDEO_CONTRAST]: 1,
  [VIDEO_SATURATION]: 1,
  [VIDEO_GAMMA]: 1,
  [VIDEO_SHARPNESS]: 0,
};

// 오디오 컴프레서 세밀 조작 + 게인(볼륨 증폭). AUDIO_COMPRESSOR(on/off)와 함께 사용.
export const AUDIO_GAIN = 'czp-audio-gain'; // 볼륨 게인 0~3 (기본 1)
export const COMP_THRESHOLD = 'czp-comp-threshold'; // -100~0 dB (기본 -50)
export const COMP_KNEE = 'czp-comp-knee'; // 0~40 dB (기본 40)
export const COMP_RATIO = 'czp-comp-ratio'; // 1~20 (기본 12)
export const COMP_ATTACK = 'czp-comp-attack'; // 0~1 s (기본 0)
export const COMP_RELEASE = 'czp-comp-release'; // 0~1 s (기본 0.25)

export const AUDIO_PARAM_KEYS = [AUDIO_GAIN, COMP_THRESHOLD, COMP_KNEE, COMP_RATIO, COMP_ATTACK, COMP_RELEASE];
export const AUDIO_PARAM_DEFAULTS: Record<string, number> = {
  [AUDIO_GAIN]: 1,
  [COMP_THRESHOLD]: -50,
  [COMP_KNEE]: 40,
  [COMP_RATIO]: 12,
  [COMP_ATTACK]: 0,
  [COMP_RELEASE]: 0.25,
};

// 비디오 지연(버퍼) 시간을 채팅 입력창 placeholder 에 표시
export const BUFFER_DISPLAY_ENABLE = 'czp-buffer-display';

// 방송(/live/**) 링크 클릭 시 새 탭으로 열기 + 백그라운드로 열기(하위)
export const LIVE_NEW_TAB = 'czp-live-new-tab';
export const LIVE_NEW_TAB_BACKGROUND = 'czp-live-new-tab-bg';

// 팔로잉 채널 변경 알림 (토스트). multiselect: 시작/종료
export const FOLLOW_NOTIFY_START = 'czp-follow-notify-start';
export const FOLLOW_NOTIFY_END = 'czp-follow-notify-end';

// 브라우저 탭(title)에 시청자 수 표기
export const TAB_VIEWER_COUNT = 'czp-tab-viewer-count';

// 통나무(파워) 자동 수집
export const POWER_COLLECT_ENABLE = 'czp-power-collect';

// 채팅 타임스탬프 (채팅 생성 시각 표시)
export const CHAT_TIMESTAMP_ENABLE = 'czp-chat-timestamp';

// 레이아웃 커스텀 (사이드바/채팅 너비 드래그 조절)
export const LAYOUT_CUSTOM_ENABLE = 'czp-layout-custom'; // 기능 on/off (드래그 핸들)
export const LAYOUT_CUSTOM_PERSIST = 'czp-layout-custom-persist'; // 항상 적용(페이지 이동/새로고침에도 저장값 반영)
export const LAYOUT_SIDEBAR_WIDTH = 'czp-layout-sidebar-width'; // px (기본 240)
export const LAYOUT_CHAT_WIDTH = 'czp-layout-chat-width'; // px (기본 353)
