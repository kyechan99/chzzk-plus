import CaptureButton from "../button/CaptureButton/CaptureButton";
// import FavoriteButton from "../button/FavoriteButton/FavoriteButton";
import RecordButton from "../button/RecordButton/RecordButton";

import "./LiveHelper.css";

export default function LiveHelper() {
  return (
    <div className="czp-live-helper">
      {/* <FavoriteButton /> */}
      <RecordButton />
      <CaptureButton />
    </div>
  );
}
