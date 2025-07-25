import { useEffect, useRef, useState } from "react";

import { logWarning } from "../../../utils/log";
import { getChannelIDByUrl } from "../../../utils/channel";

import "./Preview.css";
import { NAV_LEFT } from "../../../constants/class";

export default function Preview() {
  const ref = useRef<HTMLInputElement>(null);
  const [channelId, setChannelId] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [channelId]);

  useEffect(() => {
    const $nav_left = document.querySelectorAll(NAV_LEFT);

    if (!$nav_left || $nav_left.length < 2) return;

    const $following_channel_nav = $nav_left[1];
    const $navigation = $following_channel_nav.querySelector("ul");

    if ($navigation) {
      $navigation.addEventListener("mouseover", navHoverListener);
      $navigation.addEventListener("mouseleave", navLeaveListener);
    }

    return () => {
      if ($navigation) {
        $navigation.removeEventListener("mouseover", navHoverListener);
        $navigation.removeEventListener("mouseleave", navLeaveListener);
      }
    };
  }, [ref]);

  /**
   * 라이브 생방송 썸네일 가져오기
   */
  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://api.chzzk.naver.com/service/v2/channels/${channelId}/live-detail`
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();

      if (data.content && data.content.liveImageUrl) {
        const liveImageUrl = data.content.liveImageUrl.replace("{type}", 480);
        setThumbnail(liveImageUrl);
      } else {
        setThumbnail("");
      }
    } catch (err) {
      setThumbnail("");
      logWarning(err);
    }
  };

  /**
   * 스트리머 메뉴에 hover 시 썸네일 띄워주는 element 위치 조정
   * @param event
   */
  const navHoverListener = (event: Event) => {
    const eventTarget = event.target as HTMLElement;
    if (eventTarget.tagName === "A") {
      try {
        const rect = eventTarget.getBoundingClientRect();
        if (ref.current) {
          ref.current.style.left = 8 + rect.right + "px";
          ref.current.style.top = rect.top + 60 + "px";
          ref.current.style.display = "block";
        }

        const href = eventTarget.getAttribute("href");
        if (href) {
          const channelID = getChannelIDByUrl(href);
          setChannelId(channelID);
        }
      } catch (err) {
        logWarning(err);
      }
    }
  };

  /**
   * 스트리머 메뉴에 hover leave 시 썸네일 띄워주는 element 비활성화
   * @param event
   */
  const navLeaveListener = () => {
    if (ref.current) {
      ref.current.style.display = "none";
    }
  };

  return (
    <div className="preview" ref={ref}>
      {thumbnail && (
        <img
          src={thumbnail}
          alt="preview-thumbnail"
          className="preview-thumbnail"
        />
      )}
    </div>
  );
}
