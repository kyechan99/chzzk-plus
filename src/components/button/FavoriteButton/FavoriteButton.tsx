import React, { useEffect, useState } from "react";
import { logError } from "../../../utils/log";
import "./FavoriteButton.css";
import { FAVORITE_STREAMER } from "../../../constants/storage";
import { getChannelIDByUrl } from "../../../utils/channel";

export default function FavoriteButton() {
  const [favorited, setFavorited] = useState<boolean>(false);
  const [favStreamerList, setFavStreamerList] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observer = new MutationObserver((_mutations) => {
      checkFavorite();
    });
    observer.observe(document.head, { subtree: true, childList: true });

    checkFavorite();

    return () => {
      observer.disconnect(); // MutationObserver를 해제합니다.
    };
  }, []);

  const checkFavorite = () => {
    try {
      chrome.storage.local.get(FAVORITE_STREAMER, (res) => {
        if (res[FAVORITE_STREAMER]) {
          const streamers = JSON.parse(res[FAVORITE_STREAMER]);
          setFavStreamerList(streamers);

          const currentUrl = window.location.href;
          console.log("Cur", currentUrl);

          // 즐겨찾기한 스트리머임.
          setFavorited(streamers.includes(getChannelIDByUrl(currentUrl)));
        }
      });
    } catch (err) {
      logError(err);
    }
  };

  const captureVideo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const nowFav = !favorited;
      const channelID = getChannelIDByUrl(window.location.href);
      setFavorited(nowFav);

      if (nowFav) {
        chrome.storage.local.set({
          "czp-favorite-streamer": JSON.stringify([
            ...favStreamerList,
            channelID,
          ]),
        });
      } else {
        chrome.storage.local.set({
          "czp-favorite-streamer": JSON.stringify([
            ...favStreamerList.filter((st) => st !== channelID),
          ]),
        });
      }
    } catch (err) {
      logError(err);
    }
  };

  return (
    <button
      className={`favorite-btn ${favorited && "favorited"}`}
      onClick={captureVideo}
    >
      {favorited ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"
            stroke-width="0"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
        </svg>
      )}
      즐겨찾기
    </button>
  );
}
