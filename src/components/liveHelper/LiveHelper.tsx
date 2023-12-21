import CaptureButton from "../button/CaptureButton/CaptureButton";
import FavoriteButton from "../button/FavoriteButton/FavoriteButton";

import "./LiveHelper.css";

export default function LiveHelper() {
  return (
    <div className="czp-live-helper">
      <FavoriteButton />
      <CaptureButton />
    </div>
  );
}
