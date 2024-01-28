import CaptureButton from "../button/CaptureButton/CaptureButton";
import RecordButton from "../button/RecordButton/RecordButton";

import "./VideoHelper.css";

export default function LiveHelper() {
  return (
    <div className="czp-video-helper">
      <RecordButton />
      <CaptureButton />
    </div>
  );
}
