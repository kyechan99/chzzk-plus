import { useEffect, useRef, useState } from "react";

import { logWarning } from "../../../utils/log";
import { getChannelIDByUrl } from "../../../utils/channel";

import { FAVORITE_STREAMER } from "../../../constants/storage";
import { STREAMER_MENU, STREAMER_MENU_LIST } from "../../../constants/class";

import "./Preview.css";

export default function Preview() {
  const ref = useRef<HTMLInputElement>(null);
  const [channelId, setChannelId] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [channelId]);

  useEffect(() => {
    // MenuList가 두개가 존재함. 팔로우 채널, 추천 채널
    const $menuList = document.getElementsByClassName(STREAMER_MENU_LIST);

    if (!$menuList || $menuList.length <= 0) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observerCallback: MutationCallback = (mutationsList, _observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const addedNodes = mutation.addedNodes;
          const removedNodes = mutation.removedNodes;

          console.log("aa", addedNodes, removedNodes);

          // 새로 추가된 자식 요소에 이벤트를 추가합니다.
          for (const addedNode of addedNodes) {
            addedNode.addEventListener("mouseenter", navHoverListener);
            addedNode.addEventListener("mouseleave", navLeaveListener);
          }

          // 제거된 자식 요소에서 이벤트를 제거합니다.
          for (const removedNode of removedNodes) {
            removedNode.removeEventListener("mouseenter", navHoverListener);
            removedNode.removeEventListener("mouseleave", navLeaveListener);
          }
        }
      }
    };
    const observer = new MutationObserver(observerCallback);

    const $navigation = document.getElementById("navigation");

    const $starNavigation = document.createElement("div");
    $starNavigation.className = "navigator_wrapper__ruh6f";
    $navigation?.prepend($starNavigation);

    const $starNavigationH2 = document.createElement("h2");
    $starNavigationH2.className = "navigator_title__9RhVJ";
    $starNavigationH2.style.paddingLeft = "0.5rem";
    $starNavigationH2.style.paddingBottom = "7px";
    $starNavigationH2.innerText = "즐겨찾기 채널";
    $starNavigation.appendChild($starNavigationH2);

    const $starNavigationList = document.createElement("div");
    $starNavigationList.className = "navigator_list__cHnuV";
    $starNavigation.appendChild($starNavigationList);

    // '팔로우 채널'과 '추천 채널'을 모두 돌면서
    chrome.storage.local.get(FAVORITE_STREAMER, (res) => {
      Array.from($menuList).forEach((menu) => {
        // 처음 생성된 스트리머 메뉴에 event 추가
        const prevMenu = menu.getElementsByClassName(
          STREAMER_MENU
        ) as HTMLCollectionOf<HTMLAnchorElement>;
        Array.from(prevMenu).forEach((item) => {
          item.addEventListener("mouseenter", navHoverListener);
          item.addEventListener("mouseleave", navLeaveListener);

          // 즐겨찾기한 채널에 포함이 되는지 확인
          if (item.href && res[FAVORITE_STREAMER]) {
            const channelID = getChannelIDByUrl(item.href);
            const streamers = JSON.parse(res[FAVORITE_STREAMER]);
            if (streamers.includes(channelID)) {
              $starNavigationList.appendChild(item);
            }
          }
        });
        // '팔로우 채널'과 '추천 채널' 에 [더보기]를 눌러 새로운 스트리머를 가져온다면 해당 메뉴에 리스너 추가
        observer.observe(menu, { childList: true });
      });
    });

    return () => {
      Array.from($menuList).forEach((menu) => {
        const prevMenu = menu.getElementsByClassName(STREAMER_MENU);
        Array.from(prevMenu).forEach((item) => {
          item.removeEventListener("mouseenter", navHoverListener);
          item.removeEventListener("mouseleave", navLeaveListener);
        });
      });
      observer.disconnect();
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
    try {
      const eventTarget = event.target as HTMLAnchorElement;

      const rect = eventTarget.getBoundingClientRect();
      if (ref.current) {
        ref.current.style.left = 8 + rect.right + "px";
        ref.current.style.top = rect.top + 60 + "px";
        ref.current.style.display = "block";
      }

      if (eventTarget.href) {
        const channelID = getChannelIDByUrl(eventTarget.href);
        setChannelId(channelID);
      }
    } catch (err) {
      logWarning(err);
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
