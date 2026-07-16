export const byClass = (prefix: string): string => `[class*="${prefix}"]`;

// inject.js(MAIN world)가 React fiber 로 읽어 chzzk DOM 노드에 찍는 속성들
export const DATA_CHAT_TYPE = 'data-czp-chat-type'; // normal | cheese | blind | subscribe | cheese-ranking
export const DATA_CHAT_NICK = 'data-czp-nick'; // 채팅 작성자 닉네임
export const DATA_CHAT_ITEM = 'data-czp-chat-item'; // 채팅 한 줄(아이템) 표식

// 플레이어 레이아웃, 동영상 플레이어의 기본적인 레이아웃
export const LAYOUT_WRAP = 'layout-body';
export const PLAYER_LAYOUT_ID = 'live_player_layout';
export const VIDEO_LAYOUT_ID = 'player_layout';
export const WEBPLAYER_VIDEO = '.webplayer-internal-video';

// 플레이어를 덮어주는 UI의 부모 클래스명
export const PLAYER_UI = 'player_header';
export const VIDEO_VIEW_BTN = '.pzp-pc-viewmode-button';
export const VIDEO_FULL_BTN = '.pzp-pc-fullscreen-button__icon';
export const VIDEO_VOLUME_BTN = '.pzp-pc-volume-button__icon';
export const VIDEO_CONTAINER = byClass('live_chatting_container__');
export const VIDEO_CHAT_CLOSE_BTN = byClass('live_chatting_header_button__');
// @deprecated 클래스명 비교 대신 isTypingTarget(utils/dom) 사용. 호환을 위해 유지.
export const INPUT_UI_LIST = [
  'live_chatting_input_input__2F3Et',
  'search_input__tKVgq',
  'czp-storage-form-input',
  'live_chatting_donation_message_input__3X7ug',
  'live_chatting_popup_donation_mission_input_text__ZqIZr',
];
export const VIDEO_PIP_BTN = '.pzp-pip-button';

// 툴바 (상단 헤더 우측 영역). 치지직이 css-module 단축형으로 바꾸기 전 webpack 클래스는
// toolbar_section__ 였다. querySelector 는 union(콤마) 셀렉터의 첫 매치를 반환하므로
// 두 스킴을 모두 넣어 리빌드/롤백에 견디게 한다.
export const SECTION_TOOLBAR = '#header > *:has(button), header > *:has(button), [class*="toolbar_section__"]';

// 좌측 스트리머 목록을 나타내는 아이템의 부모 클래스 및 그 자식 클래스명
export const SIDEBAR = '#sidebar';
export const SIDEBAR_MENU = '#sidebar nav'; // 좌측 사이드바 섹션
export const SIDEBAR_MENU_ITEM = 'li, a[href^="/live/"], a[href^="/channel/"], a[href^="/"][href$="/"]';
export const STREAMER_MORE_BTN = 'button[aria-label="더보기"], button[aria-expanded]';

// 채팅 부모
export const CHAT_CONTAINER = '#aside-chatting';
export const CHAT_ITEM = '._item_sg7hy_7';
export const CHAT_NAME = '._text_dtc6c_2';
export const CHAT_WRAPPER = '._wrapper_sg7hy_25';
export const CHAT_CONTENT = '._text_1s877_1';
export const CHEEZE_CHAT = '._container_y6h6c_1._level0_y6h6c_9';
export const BLIND_CHAT = byClass('live_chatting_message_is_hidden__');
export const SUBSCRIBE_CHAT = byClass('live_chatting_list_subscription__');
export const CHEEZE_RANKING_CHAT = '._container_4gn4x_2';
export const CHAT_BUTTON = byClass('live_chatting_message_nickname__');

// 채팅 이모티콘
export const CHAT_EMOJI_AREA = '#emoji_area';
// 이모티콘 팩 탭의 id prefix (예: emoji_pack_id_dp_1)
export const EMOJI_PACK_TAB_ID_PREFIX = 'emoji_pack_id_';
// 이모티콘 검색 UI 루트 클래스 (#emoji_area 안에 마운트되므로, 네이티브 버튼 탐색 시 이 하위는 제외)
export const CHAT_EMOJI_SEARCH_ROOT_CLASS = 'czp-chat-emoji-search';

// UI 정보
export const LIVE_CONTROL_MENU = '._control_1nl77_246';
export const VIDEO_BUTTONS = '.pzp-pc__bottom-buttons-right';
export const REFRESH_BUTTON = `button[aria-label="새로고침"]`; //  새로고침 버튼
// 유저(닉네임 클릭) 팝업. 현재 css-module 셀렉터 + cheese-knife 검증 webpack 폴백을 union.
export const USER_POPUP_CONTENTS =
  '._container_10ysp_20._container_1hyev_2 ._list_1hyev_264, [class*="live_chatting_popup_profile_container__"]';
export const USER_POPUP_NAME =
  'span._wrapper_1hyev_87 > strong > span > span, [class*="live_chatting_popup_profile_name__"]';

// VOD(다시보기) 페이지의 우측 채팅/정보 패널 (#aside-chatting 의 video 버전)
export const VOD_ASIDE = '#vod-aside';
// Aside 패널에서 팝업된 영역의 컨텐츠 컨테이너
export const ASIDE_POPUP_CONTENTS = '#popup_contents';

// 채팅
export const CHATTING_TOOLS = '#aside-chatting';
export const CHATTING_ACTIONS = byClass('_donation_');
// 우리 고정 박스를 "같은 레벨"로 붙일 네이티브 고정 메시지 컨테이너 찾기 (resilient union).
export const CHATTING_FIXED_AREA = '[class*="_fixed_"], [class*="live_chatting_list_fixed__"]';
// 고정 영역이 없는 채팅창에서 새로 만들 때 부여할 클래스명 (네이티브 고정 영역 스타일 차용).
export const CHATTING_DONATION_POPUP = byClass('live_chatting_popup_donation_layer__'); // 채팅창 후원하기 창
export const CHATTING_AREA = byClass('live_chatting_area__');
export const CHATTING_BADGE = '._wrapper_o04z9_23';
// 채팅 입력창 (버퍼/지연 시간을 placeholder 로 표시). css-module + webpack 폴백 union.
export const CHAT_INPUT = '._input_1xxwu_59._default_1xxwu_77, [class*="live_chatting_input_input__"]';
// 채팅 입력창의 contenteditable 요소. CHAT_INPUT 은 _default_ 클래스를 요구해 내용이 있으면 매칭 실패하므로,
// 포커스 용도로는 해시에 의존하지 않는 이 셀렉터를 사용한다.
export const CHAT_INPUT_EDITABLE =
  '#aside-chatting pre[contenteditable="true"], #aside-chatting [contenteditable="true"], #aside-chatting textarea, #aside-chatting input';
export const CHAT_USER_AREA = '._area_1qgfi_49';

// 동영상 Card UI
export const VIDEO_CARD_LIST = '.component_list__DNd2B'; // 라이브 페이지의 비디오 ul
export const VIDEO_CARD_LIST_CT = '.component_list__Matsy'; // 카테고리 페이지의 비디오 ul
export const BLOCKED_VIDEO_CARD = '_is_block_ul5zy_37'; // 차단된 방송
