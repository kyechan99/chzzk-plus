import "./App.css";

import Logo from "../public/icon128.png";
import { Select } from "./components/input/Select/Select";
import Checkbox from "./components/input/Checkbox/Checkbox";
import URLButton from "./components/button/URLButton/URLButton";
import ColorPicker from "./components/input/ColorPicker/ColorPicker";

import {
  AUDIO_COMPRESSOR,
  BLIND_REMOVER,
  BLOCKED_STREAMER,
  CHAT_COLOR_OPTIONS,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_SIZE_OPTIONS,
  CHAT_TEXT_COLOR,
  CHEEZE_REMOVER,
  FAST_BUTTON,
  FOLLOWING_REFRESH_ENABLE,
  ONLIVE_REFRESH,
  RECORD_ENABLE,
  SUBSCRIBE_REMOVER,
} from "./constants/storage";

function App() {
  return (
    <div className="popup">
      <img src={Logo} alt="chzzk-plus" />

      <URLButton href="https://chzzk.naver.com/">Chzzk 이동하기</URLButton>
      <URLButton href="https://github.com/kyechan99/chzzk-plus/issues">
        버그 및 기능 제보
      </URLButton>

      <hr />

      <div className="setting-group">
        <h2 className="setting-label">채널</h2>
        <div className="menus">
          <div className="menu">
            <p className="menu-title">프리뷰</p>
            <p className="menu-desc">생방송 실시간 프리뷰 표시</p>
          </div>

          <div className="menu">
            <p className="menu-title">
              <del>[베타] 즐겨찾기</del>
            </p>
            <p className="menu-desc">
              <del>'팔로우 채널' 중 우선순위 올리기</del>
            </p>
            <p className="menu-desc">v1.2.0 부터 기능을 제거하였습니다.</p>
            <p className="menu-desc">버그 해결 후 돌아오겠습니다.</p>
          </div>

          <Checkbox id={FOLLOWING_REFRESH_ENABLE}>
            <div className="menu">
              <p className="menu-title">팔로우 채널 자동 새로고침</p>
              <p className="menu-desc">30초 간격으로 자동 새로고침합니다.</p>
            </div>
          </Checkbox>
        </div>
      </div>

      <hr />

      <div className="setting-group">
        <h2 className="setting-label">플레이어</h2>
        <div className="menus">
          <div className="menu">
            <p className="menu-title">플레이어 도우미</p>
            <p className="menu-desc">오디오 압축</p>
            <p className="menu-desc">빨리감기</p>
          </div>

          <Checkbox id={RECORD_ENABLE}>
            <div className="menu">
              <p className="menu-title">녹화 기능 활성화 *</p>
              <p className="menu-desc">스크린샷 (단축키: S)</p>
              <p className="menu-desc">[베타] 녹화</p>
            </div>
          </Checkbox>

          <Checkbox id={FAST_BUTTON}>
            <div className="menu">
              <p className="menu-title">빨리 감기 활성화 *</p>
              <p className="menu-desc">새로고침 후 적용</p>
              <p className="menu-desc">]: 빨리 감기</p>
              <p className="menu-desc">[: 느리게 감기</p>
              <p className="menu-desc">=: 기본</p>
            </div>
          </Checkbox>

          <Checkbox id={AUDIO_COMPRESSOR}>
            <div className="menu">
              <p className="menu-title">사운드 압축 *</p>
              <p className="menu-desc">높고 낮은 음압 간의 차이를 줄임</p>
              <p className="menu-desc">일정한 음량 수준을 유지</p>
            </div>
          </Checkbox>
        </div>
      </div>

      <hr />

      <div className="setting-group">
        <h2 className="setting-label">생방송</h2>
        <div className="menus">
          <Checkbox id={ONLIVE_REFRESH}>
            <div className="menu">
              <p className="menu-title">방송 새로고침</p>
              <p className="menu-desc">방송 시작시 자동 새로고침</p>
            </div>
          </Checkbox>

          <Checkbox id={BLOCKED_STREAMER}>
            <div className="menu">
              <p className="menu-title">차단한 방송 완전 제거</p>
              <p className="menu-desc">라이브 목록에서 차단한 방송 완전 제거</p>
            </div>
          </Checkbox>
        </div>
      </div>

      <hr />

      <div className="setting-group">
        <h2 className="setting-label">채팅</h2>
        <div className="menus">
          <Checkbox id={CHEEZE_REMOVER}>
            <div className="menu">
              <p className="menu-title">치즈 제거 *</p>
              <p className="menu-desc">새로고침 후 적용</p>
            </div>
          </Checkbox>

          <Checkbox id={BLIND_REMOVER}>
            <div className="menu">
              <p className="menu-title">블라인드 챗 완전 제거 *</p>
              <p className="menu-desc">새로고침 후 적용</p>
            </div>
          </Checkbox>

          <Checkbox id={SUBSCRIBE_REMOVER}>
            <div className="menu">
              <p className="menu-title">구독 챗 완전 제거 *</p>
              <p className="menu-desc">새로고침 후 적용</p>
            </div>
          </Checkbox>

          <Select
            id={CHAT_COLOR_THEME}
            options={CHAT_COLOR_OPTIONS.map((op) => {
              return { name: op, value: op };
            })}
          >
            <div className="menu">
              <p className="menu-title">채팅 이름에 색상넣기 *</p>
              <p className="menu-desc">새로고침 후 적용</p>
            </div>
          </Select>

          <ColorPicker id={CHAT_NAME_COLOR}>
            <div className="menu">
              <p className="menu-title">이름 색</p>
              <p className="menu-desc">'커스텀' 모드에서 작동</p>
            </div>
          </ColorPicker>
          <ColorPicker id={CHAT_TEXT_COLOR}>
            <div className="menu">
              <p className="menu-title">내용 색</p>
              <p className="menu-desc">'커스텀' 모드에서 작동</p>
            </div>
          </ColorPicker>

          <Select
            id={CHAT_SIZE}
            options={CHAT_SIZE_OPTIONS.map((op) => {
              return { name: op, value: op };
            })}
          >
            <div className="menu">
              <p className="menu-title">채팅 크기 *</p>
              <p className="menu-desc">새로고침 후 적용</p>
            </div>
          </Select>
        </div>
      </div>

      <hr />

      <p className="description">* 표시된 설정은 새로고침 후 적용됩니다</p>
      <p className="version">v1.3.1</p>
    </div>
  );
}

export default App;
