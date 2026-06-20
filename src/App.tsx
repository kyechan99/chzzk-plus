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
  LIVE_NEW_TAB,
  LIVE_NEW_TAB_BACKGROUND,
  CHAT_BADGE_REMOVER,
  CHAT_COLOR_OPTIONS,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_SIZE_OPTIONS,
  CHAT_STORAGE_ENABLE,
  CHAT_TEXT_COLOR,
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

  return (
    <div className="popup">
      <SettingsNav items={NAV_ITEMS} scrollContainerRef={scrollContainerRef} />

      <div className="settings-content" ref={scrollContainerRef}>
        <div className="settings-content-header">
          <img src={'https://github.com/kyechan99/chzzk-plus/raw/main/public/icon128.png'} alt="cheese-plus" />
          <h2 className="settings-content-title">확장 프로그램 설정</h2>
        </div>

        <URLButton href="https://chzzk.naver.com/">Chzzk 이동하기</URLButton>

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
                <p className="menu-desc">우측 상단에 토스트로 표시 (최대 3개)</p>
              </div>
            </div>
          </div>

          <Checkbox id={FOLLOW_NOTIFY_START} className="depth-2">
            <div className="menu">
              <p className="menu-title">방송 시작 알림</p>
            </div>
          </Checkbox>
          <Checkbox id={FOLLOW_NOTIFY_END} className="depth-2 depth-last">
            <div className="menu">
              <p className="menu-title">방송 종료 알림</p>
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

            <Checkbox id={AUTO_WIDE_MODE}>
              <div className="menu">
                <p className="menu-title">자동 넓은 화면 *</p>
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
                <p className="menu-title">방송 새로고침</p>
                <p className="menu-desc">방송 시작시 자동 새로고침</p>
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

        <URLButton href="https://github.com/kyechan99/chzzk-plus/issues">버그 및 기능 제보</URLButton>
        <p className="version">v2.0.1</p>
      </div>

      <ReloadBanner watchKeys={NEEDS_RELOAD_KEYS} />
    </div>
  );
}

export default App;
