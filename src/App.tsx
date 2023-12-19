import "./App.css";

import Logo from "../public/icon128.png";
import URLButton from "./components/button/URLButton/URLButton";

function App() {
  return (
    <div className="popup">
      <img src={Logo} alt="chzzk-plus" />
      <URLButton href="https://chzzk.naver.com/">Chzzk 이동하기</URLButton>
    </div>
  );
}

export default App;
