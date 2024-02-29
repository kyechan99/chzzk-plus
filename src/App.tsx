import "./App.css";

import Logo from "../public/icon128.png";
import { Select } from "./components/input/Select/Select";
import Checkbox from "./components/input/Checkbox/Checkbox";
import URLButton from "./components/button/URLButton/URLButton";
import ColorPicker from "./components/input/ColorPicker/ColorPicker";

import {
  AUDIO_COMPRESSOR,
  CHAT_COLOR_OPTIONS,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_SIZE,
  CHAT_SIZE_OPTIONS,
  CHAT_TEXT_COLOR,
  CHEEZE_REMOVER,
  FAST_BUTTON,
  PLAYER_KEY_CONTROL,
} from "./constants/storage";

function App() {
  return (
    <div className="popup">
      <img src={Logo} alt="chzzk-plus" />

      <URLButton href="https://chzzk.naver.com/">Chzzk 이동하기</URLButton>
      <URLButton href="https://github.com/kyechan99/chzzk-plus/issues">
        버그 제보하기
      </URLButton>

      <hr />

      <div className="setting-group">
        <h2 className="setting-label">플레이어</h2>
        <div className="menus">
          <div className="menu">
            <p className="menu-title">추가 설정</p>
            <p className="menu-desc">S: 스크린샷</p>
          </div>

          <Checkbox id={PLAYER_KEY_CONTROL}>
            <div className="menu">
              <p className="menu-title">키 이벤트 활성화 *</p>
              <p className="menu-desc">T: 넓은 화면</p>
              <p className="menu-desc">F: 전체 화면</p>
              <p className="menu-desc">M: 음소거</p>
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
        <h2 className="setting-label">채팅</h2>
        <div className="menus">
          <Checkbox id={CHEEZE_REMOVER}>
            <div className="menu">
              <p className="menu-title">치즈 제거 *</p>
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
      <p className="version">v1.0.12</p>
    </div>
  );
}

export default App;
