import { log } from '../../../utils/log';
import './Barricade.css';

/**
 * @deprecated chzzk 업데이트로 인해 더 이상 사용하지 않습니다.
 */
export default function Barricade() {
  const onClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    log('[Cheese Plus] - 화면 일시정지 막는중');
  };

  return <div id="barricade" className="barricade" onClick={onClickHandler}></div>;
}
