import "./App.css";

import Logo from "../public/icon128.png";
import URLButton from "./components/button/URLButton/URLButton";
import Checkbox from "./components/input/Checkbox/Checkbox";

function App() {
  return (
    <div className="popup">
      <img src={Logo} alt="chzzk-plus" />
      <URLButton href="https://chzzk.naver.com/">Chzzk 이동하기</URLButton>
      <hr />
      <div className="menu">
        <Checkbox id="barricade">화면 클릭시 일시정지 방지 *</Checkbox>
      </div>
      <hr />
      <p className="description">* 표시된 설정은 새로고침 후 적용됩니다</p>
    </div>
  );
}

export default App;
