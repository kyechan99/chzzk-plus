import { log } from "../../../utils/log";
import "./Barricade.css";

export default function Barricade() {
  const onClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    log("[Chzzk Plus] - 화면 일시정지 막는중");
  };

  return (
    <div id="barricade" className="barricade" onClick={onClickHandler}></div>
  );
}
