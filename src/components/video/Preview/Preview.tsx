import { useEffect, useState } from "react";
import "./Preview.css";
import { logError } from "../../../utils/log";

export default function Preview() {
  const [thumbnail, setThumbnail] = useState<string>("");
  const apiUrl =
    "https://api.chzzk.naver.com/service/v1/channels/fe558c6d1b8ef3206ac0bc0419f3f564/live-detail";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        const liveImageUrl = data.content.liveImageUrl.replace("{type}", 480);
        setThumbnail(liveImageUrl);
      } catch (err) {
        logError(err);
      }
    };

    fetchData();
  }, [apiUrl]);

  return (
    <div className="preview">
      {thumbnail && (
        <img src={thumbnail} alt="" className="preview-thumbnail" />
      )}
    </div>
  );
}
