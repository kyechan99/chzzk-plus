import './App.css';
import { useRef } from 'react';

import { Select } from './components/input/Select/Select';
import Checkbox from './components/input/Checkbox/Checkbox';
import Range from './components/input/Range/Range';
import URLButton from './components/button/URLButton/URLButton';
import ColorPicker from './components/input/ColorPicker/ColorPicker';
import List from './components/List/List';
import FavoriteGroupManager from './components/favoriteGroupManager/FavoriteGroupManager';
import SettingsNav, { SettingsNavItem } from './components/nav/settingsNav/SettingsNav';
import ReloadBanner from './components/ReloadBanner/ReloadBanner';

import {
  AUDIO_COMPRESSOR,
  AUDIO_COMPRESSOR_AUTO,
  AUDIO_GAIN,
  AUTO_WIDE_MODE,
  BLIND_REMOVER,
  BLOCKED_STREAMER,
  BUFFER_DISPLAY_ENABLE,
  LAYOUT_CHAT_WIDTH,
  LAYOUT_CUSTOM_ENABLE,
  LAYOUT_CUSTOM_PERSIST,
  LAYOUT_SIDEBAR_WIDTH,
  LIVE_NEW_TAB,
  LIVE_NEW_TAB_BACKGROUND,
  CHAT_BADGE_REMOVER,
  CHAT_COLOR_OPTIONS,
  CHAT_COLOR_THEME,
  CHAT_EMOJI_SEARCH_ENABLE,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_SIZE_OPTIONS,
  CHAT_STORAGE_ENABLE,
  CHAT_TEXT_COLOR,
  CHAT_TIMESTAMP_ENABLE,
  CHEEZE_RANKING_REMOVER,
  CHEEZE_REMOVER,
  COMP_ATTACK,
  COMP_KNEE,
  COMP_RATIO,
  COMP_RELEASE,
  COMP_THRESHOLD,
  FAST_BUTTON,
  FAVORITE_ENABLE,
  FOLLOW_NOTIFY_END,
  FOLLOW_NOTIFY_START,
  FOLLOWING_REFRESH_ENABLE,
  GUARD_ENALBE,
  MESSAGE_PIN_ENABLE,
  MESSAGE_PIN_USERS,
  ONLIVE_REFRESH,
  PIP_BUTTON,
  POWER_COLLECT_ENABLE,
  PREVIEW_ENABLE,
  SUBSCRIBE_REMOVER,
  TAB_VIEWER_COUNT,
  VIDEO_BRIGHTNESS,
  VIDEO_CONTRAST,
  VIDEO_GAMMA,
  VIDEO_SATURATION,
  VIDEO_SHARPNESS,
} from './constants/storage';

const NAV_ITEMS: SettingsNavItem[] = [
  { id: 'section-sidebar', label: '사이드바' },
  { id: 'section-channel', label: '채널' },
  { id: 'section-player', label: '플레이어' },
  { id: 'section-live', label: '생방송' },
  { id: 'section-chat', label: '채팅' },
  { id: 'section-etc', label: '기타' },
];

// '*' 표시되어 새로고침 후 적용되는 설정들의 storage key 목록
const NEEDS_RELOAD_KEYS: string[] = [
  PREVIEW_ENABLE,
  FAVORITE_ENABLE,
  PIP_BUTTON,
  AUDIO_COMPRESSOR,
  AUDIO_COMPRESSOR_AUTO,
  AUTO_WIDE_MODE,
  FAST_BUTTON,
  BUFFER_DISPLAY_ENABLE,
  GUARD_ENALBE,
  CHAT_STORAGE_ENABLE,
  CHAT_SIZE,
  CHEEZE_REMOVER,
  CHEEZE_RANKING_REMOVER,
  BLIND_REMOVER,
  SUBSCRIBE_REMOVER,
  CHAT_BADGE_REMOVER,
  CHAT_COLOR_THEME,
  MESSAGE_PIN_ENABLE,
];

function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const resetLayoutCustom = () => {
    // 저장값 삭제 → 우리 CSS 미주입 → 사이트 기본값 그대로 복원
    chrome.storage.local.remove([LAYOUT_SIDEBAR_WIDTH, LAYOUT_CHAT_WIDTH]);
  };

  return (
    <div className="popup">
      <SettingsNav items={NAV_ITEMS} scrollContainerRef={scrollContainerRef} />

      <div className="settings-content" ref={scrollContainerRef}>
        <div className="settings-content-header">
          <img src={'https://github.com/kyechan99/chzzk-plus/raw/main/public/icon128.png'} alt="cheese-plus" />
          <h2 className="settings-content-title">확장 프로그램 설정</h2>
        </div>

        <div className="settings-content-body">
          <URLButton href="https://chzzk.naver.com/">Chzzk 이동하기</URLButton>

          <URLButton variant="secondary" href="https://github.com/kyechan99/chzzk-plus/issues">
            버그 및 기능 제보
          </URLButton>
        </div>

        <p className="version">v2.0.4</p>

        <p className="description">* 표시된 설정은 새로고침 후 적용됩니다</p>

        <hr />

        <div className="setting-group" id="section-sidebar">
          <h2 className="setting-label">사이드바</h2>
          <div className="menus">
            <Checkbox id={PREVIEW_ENABLE}>
              <div className="menu">
                <p className="menu-title">프리뷰 *</p>
                <p className="menu-desc">생방송 실시간 프리뷰 표시</p>
              </div>
            </Checkbox>

            <Checkbox id={FOLLOWING_REFRESH_ENABLE}>
              <div className="menu">
                <p className="menu-title">팔로우 채널 자동 새로고침</p>
                <p className="menu-desc">10초 간격으로 자동 새로고침합니다.</p>
              </div>
            </Checkbox>

            <Checkbox id={FAVORITE_ENABLE}>
              <div className="menu">
                <p className="menu-title">즐겨찾기 *</p>
                <p className="menu-desc">즐겨찾기 채널 그룹별로 상단 고정</p>
                <p className="menu-desc">라이브 페이지의 즐겨찾기 버튼으로 그룹 지정</p>
              </div>
            </Checkbox>

            <div className="form-group depth-2 depth-last">
              <div className="menu">
                <p className="menu-title">즐겨찾기 그룹 관리</p>
                <p className="menu-desc">그룹 이름과 아이콘을 변경하거나 새 그룹을 추가합니다</p>
                <FavoriteGroupManager />
              </div>
            </div>
          </div>
        </div>

        <hr />
        <div className="setting-group" id="section-channel">
          <h2 className="setting-label">채널</h2>
          <Checkbox id={BLOCKED_STREAMER}>
            <div className="menu">
              <p className="menu-title">차단한 방송 완전 제거</p>
              <p className="menu-desc">라이브 목록에서 차단한 방송 완전 제거</p>
            </div>
          </Checkbox>

          <div className="form-group">
            <div className="menus">
              <div className="menu">
                <p className="menu-title">팔로잉 채널 변경 알림</p>
                <p className="menu-desc">우측 상단에 토스트로 표시 (최대 4개)</p>
              </div>
            </div>
          </div>

          <Checkbox id={FOLLOW_NOTIFY_START} className="depth-2">
            <div className="menu">
              <p className="menu-title">방송 시작 알림</p>
              <p className="menu-desc">(팔로잉 채널이 열려있어야 동작)</p>
            </div>
          </Checkbox>
          <Checkbox id={FOLLOW_NOTIFY_END} className="depth-2 depth-last">
            <div className="menu">
              <p className="menu-title">방송 종료 알림</p>
              <p className="menu-desc">(팔로잉 채널이 열려있어야 동작)</p>
            </div>
          </Checkbox>

          <Checkbox id={LIVE_NEW_TAB}>
            <div className="menu">
              <p className="menu-title">생방송 새 탭으로 열기</p>
              <p className="menu-desc">방송 채널에 진입할때 새 탭에서 엽니다</p>
            </div>
          </Checkbox>
          <Checkbox id={LIVE_NEW_TAB_BACKGROUND} className="depth-2 depth-last">
            <div className="menu">
              <p className="menu-title">백그라운드로 열기</p>
              <p className="menu-desc">'새 탭으로 열기'가 켜져 있어야 동작</p>
              <p className="menu-desc">현재 탭을 유지한 채 뒤에서 엽니다</p>
            </div>
          </Checkbox>
        </div>

        <hr />

        <div className="setting-group" id="section-player">
          <h2 className="setting-label">플레이어</h2>
          <div className="menus">
            <Checkbox id={PIP_BUTTON}>
              <div className="menu">
                <p className="menu-title">PIP 키 이벤트 활성화 *</p>
                <p className="menu-desc">q: PIP ON / OFF</p>
              </div>
            </Checkbox>

            <Checkbox id={AUTO_WIDE_MODE} disabled>
              <div className="menu">
                <p className="menu-title">자동 넓은 화면 *</p>
                <p className="menu-desc">(현재 비활성화된 기능입니다.)</p>
              </div>
            </Checkbox>

            <Checkbox id={AUDIO_COMPRESSOR}>
              <div className="menu">
                <p className="menu-title">사운드 압축 *</p>
                <p className="menu-desc">높고 낮은 음압 간의 차이를 줄임</p>
                <p className="menu-desc">일정한 음량 수준을 유지</p>
              </div>
            </Checkbox>

            <Checkbox id={AUDIO_COMPRESSOR_AUTO} className="depth-2">
              <div className="menu">
                <p className="menu-title">사운드 압축 항상 자동 활성화 *</p>
                <p className="menu-desc">새 라이브 진입 시 자동으로 켜짐</p>
              </div>
            </Checkbox>

            <div className="form-group depth-2 depth-last">
              <div className="menu">
                <p className="menu-title">사운드 세밀 조작</p>
                <p className="menu-desc">사운드 압축 버튼이 켜진 상태에서 실시간 적용</p>
              </div>
            </div>

            <Range id={AUDIO_GAIN} min={0} max={3} step={0.05} digits={2} defaultValue={1} className="depth-3">
              <div className="menu">
                <p className="menu-title">볼륨 게인</p>
                <p className="menu-desc">1보다 크면 볼륨 증폭</p>
              </div>
            </Range>
            <Range
              id={COMP_THRESHOLD}
              min={-100}
              max={0}
              step={1}
              digits={0}
              unit="dB"
              defaultValue={-50}
              className="depth-3"
            >
              <div className="menu">
                <p className="menu-title">임계값 (Threshold)</p>
              </div>
            </Range>
            <Range id={COMP_KNEE} min={0} max={40} step={1} digits={0} unit="dB" defaultValue={40} className="depth-3">
              <div className="menu">
                <p className="menu-title">니 (Knee)</p>
              </div>
            </Range>
            <Range id={COMP_RATIO} min={1} max={20} step={0.5} digits={1} defaultValue={12} className="depth-3">
              <div className="menu">
                <p className="menu-title">압축 비율 (Ratio)</p>
              </div>
            </Range>
            <Range
              id={COMP_ATTACK}
              min={0}
              max={1}
              step={0.01}
              digits={2}
              unit="s"
              defaultValue={0}
              className="depth-3"
            >
              <div className="menu">
                <p className="menu-title">어택 (Attack)</p>
              </div>
            </Range>
            <Range
              id={COMP_RELEASE}
              min={0}
              max={1}
              step={0.01}
              digits={2}
              unit="s"
              defaultValue={0.25}
              className="depth-3 depth-last"
            >
              <div className="menu">
                <p className="menu-title">릴리즈 (Release)</p>
              </div>
            </Range>

            <div className="form-group">
              <div className="menu">
                <p className="menu-title">비디오 필터</p>
                <p className="menu-desc">영상에 실시간 적용 (기본값이면 효과 없음)</p>
              </div>
            </div>

            <Range id={VIDEO_BRIGHTNESS} min={0} max={2} step={0.05} digits={2} defaultValue={1} className="depth-2">
              <div className="menu">
                <p className="menu-title">밝기</p>
              </div>
            </Range>
            <Range id={VIDEO_CONTRAST} min={0} max={2} step={0.05} digits={2} defaultValue={1} className="depth-2">
              <div className="menu">
                <p className="menu-title">대비</p>
              </div>
            </Range>
            <Range id={VIDEO_SATURATION} min={0} max={3} step={0.05} digits={2} defaultValue={1} className="depth-2">
              <div className="menu">
                <p className="menu-title">채도</p>
              </div>
            </Range>
            <Range id={VIDEO_GAMMA} min={0} max={3} step={0.05} digits={2} defaultValue={1} className="depth-2">
              <div className="menu">
                <p className="menu-title">감마</p>
              </div>
            </Range>
            <Range
              id={VIDEO_SHARPNESS}
              min={0}
              max={10}
              step={0.1}
              digits={1}
              defaultValue={0}
              className="depth-2 depth-last"
            >
              <div className="menu">
                <p className="menu-title">선명도</p>
              </div>
            </Range>
          </div>
        </div>

        <hr />

        <div className="setting-group" id="section-live">
          <h2 className="setting-label">생방송</h2>

          <div className="menus">
            <Checkbox id={FAST_BUTTON}>
              <div className="menu">
                <p className="menu-title">빨리 감기 활성화 *</p>
                <p className="menu-desc">]: 빨리 감기</p>
                <p className="menu-desc">[: 느리게 감기</p>
                <p className="menu-desc">=: 기본</p>
              </div>
            </Checkbox>

            <Checkbox id={BUFFER_DISPLAY_ENABLE}>
              <div className="menu">
                <p className="menu-title">지연 시간(버퍼) 표시 *</p>
                <p className="menu-desc">채팅 입력창에 라이브 지연 시간을 표시</p>
              </div>
            </Checkbox>

            <Checkbox id={ONLIVE_REFRESH}>
              <div className="menu">
                <p className="menu-title">방송 시작시 자동 새로고침</p>
                <p className="menu-desc">스트리머의 /live/*** 주소 상태에서 동작</p>
              </div>
            </Checkbox>

            <Checkbox id={TAB_VIEWER_COUNT}>
              <div className="menu">
                <p className="menu-title">브라우저 탭에 시청자 수 표기</p>
                <p className="menu-desc">탭 제목에 시청자수 추가</p>
              </div>
            </Checkbox>

            <Checkbox id={POWER_COLLECT_ENABLE}>
              <div className="menu">
                <p className="menu-title">통나무 자동 수집</p>
                <p className="menu-desc">시청 중인 채널의 통나무(파워) 자동 수령</p>
              </div>
            </Checkbox>

            <Checkbox id={GUARD_ENALBE}>
              <div className="menu">
                <p className="menu-title">방송 보호기 *</p>
                <p className="menu-desc">방송 화면 및 채팅 가리기 버튼</p>
              </div>
            </Checkbox>
          </div>
        </div>

        <hr />

        <div className="setting-group" id="section-chat">
          <h2 className="setting-label">채팅</h2>
          <div className="menus">
            <Checkbox id={CHAT_STORAGE_ENABLE}>
              <div className="menu">
                <p className="menu-title">채팅 저장소 *</p>
              </div>
            </Checkbox>

            <Checkbox id={CHAT_TIMESTAMP_ENABLE}>
              <div className="menu">
                <p className="menu-title">채팅 타임스탬프</p>
                <p className="menu-desc">채팅 옆에 도착 시각 표시</p>
              </div>
            </Checkbox>

            <Checkbox id={CHAT_EMOJI_SEARCH_ENABLE}>
              <div className="menu">
                <p className="menu-title">이모티콘 검색</p>
                <p className="menu-desc">이모티콘 팝업 상단에 검색창 표시</p>
              </div>
            </Checkbox>

            <Select
              id={CHAT_SIZE}
              options={CHAT_SIZE_OPTIONS.map(op => {
                return { name: op, value: op };
              })}
            >
              <div className="menu">
                <p className="menu-title">채팅 크기 *</p>
              </div>
            </Select>

            <Checkbox id={CHEEZE_REMOVER}>
              <div className="menu">
                <p className="menu-title">치즈 제거 *</p>
              </div>
            </Checkbox>

            <Checkbox id={CHEEZE_RANKING_REMOVER}>
              <div className="menu">
                <p className="menu-title">주간 후원 랭킹 제거 *</p>
              </div>
            </Checkbox>

            <Checkbox id={BLIND_REMOVER}>
              <div className="menu">
                <p className="menu-title">블라인드 챗 완전 제거 *</p>
              </div>
            </Checkbox>

            <Checkbox id={SUBSCRIBE_REMOVER}>
              <div className="menu">
                <p className="menu-title">구독 챗 완전 제거 *</p>
              </div>
            </Checkbox>

            <Checkbox id={CHAT_BADGE_REMOVER}>
              <div className="menu">
                <p className="menu-title">채팅 뱃지 완전 제거 *</p>
              </div>
            </Checkbox>

            <Select
              id={CHAT_COLOR_THEME}
              options={CHAT_COLOR_OPTIONS.map(op => {
                return { name: op, value: op };
              })}
            >
              <div className="menu">
                <p className="menu-title">채팅 이름에 색상넣기 *</p>
              </div>
            </Select>

            <ColorPicker id={CHAT_NAME_COLOR} className="depth-2">
              <div className="menu">
                <p className="menu-title">이름 색</p>
                <p className="menu-desc">'커스텀' 모드에서 작동</p>
              </div>
            </ColorPicker>
            <ColorPicker id={CHAT_TEXT_COLOR} className="depth-2">
              <div className="menu">
                <p className="menu-title">내용 색</p>
                <p className="menu-desc">'커스텀' 모드에서 작동</p>
              </div>
            </ColorPicker>

            <List id={MESSAGE_PIN_USERS} saveButtonText="추가" inputPlaceholder="닉네임 입력">
              <Checkbox id={MESSAGE_PIN_ENABLE}>
                <div className="menu">
                  <p className="menu-title">유저 고정 리스트 *</p>
                </div>
              </Checkbox>
            </List>
          </div>
        </div>

        <hr />

        <div className="setting-group" id="section-etc">
          <h2 className="setting-label">기타</h2>
          <div className="menus">
            <Checkbox id={LAYOUT_CUSTOM_ENABLE}>
              <div className="menu">
                <p className="menu-title">레이아웃 커스텀</p>
                <p className="menu-desc">사이드바/채팅 모서리를 드래그해 너비 조절</p>
              </div>
            </Checkbox>

            <Checkbox id={LAYOUT_CUSTOM_PERSIST} className="depth-2">
              <div className="menu">
                <p className="menu-title">항상 적용</p>
                <p className="menu-desc">페이지를 이동/새로고침해도 저장된 너비 유지</p>
              </div>
            </Checkbox>

            <div className="form-group depth-2 depth-last">
              <div className="menu">
                <p className="menu-title">커스텀한 레이아웃 값 초기화</p>
              </div>
              <button type="button" className="czp-range-reset" onClick={resetLayoutCustom}>
                레이아웃 초기화
              </button>
            </div>
          </div>
        </div>

        <hr />

        <div className="settings-disclaimer">
          <ul>
            <li>치즈 플러스는 스트리밍 서비스 치지직(Chzzk)을 위한 비공식 오픈소스 확장 프로그램입니다.</li>
            <li>본 확장 프로그램은 치지직 및 네이버와 어떠한 공식적인 연관이나 제휴 관계가 없습니다.</li>
            <li>
              서비스 정책 및 플랫폼 구조를 준수하며, 저작권 및 비즈니스 모델(BM)을 침해할 수 있는 기능(예: 캡처, 녹화
              등)은 제공하지 않습니다.
            </li>
            <li>치지직 또는 네이버의 정책 변경이나 요청에 따라 일부 기능은 사전 고지 없이 제거될 수 있습니다.</li>
            <li>확장 프로그램 사용으로 인해 발생하는 문제에 대해서는 개발자가 책임을 보장하지 않습니다.</li>
            <li>
              치지직 서비스 자체의 업데이트로 인해 특정 기능이 일시적으로 동작하지 않을 수 있습니다.
              <br />
              해당 기능이 복구되기 전까지 비활성화하여 기다려주시면 감사드리겠습니다.
            </li>
            <li>
              Cheese-Plus는 오픈소스로 개발되고 있습니다.
              <br />
              기능 제안 및 개발 기여 모두 적극적으로 받고있습니다.
            </li>
          </ul>
        </div>
      </div>

      <ReloadBanner watchKeys={NEEDS_RELOAD_KEYS} />
    </div>
  );
}

export default App;
