import "./App.css";

import Logo from "../public/icon128.png";
import { Select } from "./components/input/Select/Select";
import Checkbox from "./components/input/Checkbox/Checkbox";
import URLButton from "./components/button/URLButton/URLButton";
import ColorPicker from "./components/input/ColorPicker/ColorPicker";

import {
  BARRICADE,
  CHAT_COLOR_OPTIONS,
  CHAT_COLOR_THEME,
  CHAT_NAME_COLOR,
  CHAT_TEXT_COLOR,
  CHEEZE_REMOVER,
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
          <Checkbox id={BARRICADE}>
            <div className="menu">
              <p className="menu-title">화면 클릭시 일시정지 방지 *</p>
              <p className="menu-desc">새로고침 후 적용됩니다</p>
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
              <p className="menu-desc">새로고침 후 적용됩니다</p>
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
              <p className="menu-desc">새로고침 후 적용됩니다</p>
            </div>
          </Select>

          <ColorPicker id={CHAT_NAME_COLOR}>
            <div className="menu">
              <p className="menu-title">채팅 이름 색상</p>
              <p className="menu-desc">'테마' 모드에서 작동합니다</p>
            </div>
          </ColorPicker>
          <ColorPicker id={CHAT_TEXT_COLOR}>
            <div className="menu">
              <p className="menu-title">채팅 내용 색상</p>
              <p className="menu-desc">'테마', '커스텀' 모드에서 작동합니다</p>
            </div>
          </ColorPicker>
        </div>
      </div>

      <hr />

      <p className="description">* 표시된 설정은 새로고침 후 적용됩니다</p>
    </div>
  );
}

export default App;
