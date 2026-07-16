import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { logWarning } from '../../../utils/log';
import { getChannelIDByUrl } from '../../../utils/channel';
import { getLiveDetail } from '../../../utils/stream';
import { SIDEBAR } from '../../../constants/class';
import { PREVIEW_VOLUME } from '../../../constants/storage';

import './Preview.css';

const isLiveSidebarItem = (element: HTMLElement): boolean => {
  const item = element.closest('li');
  if (!item) return false;

  const anchor = element.closest('a');
  const href = anchor?.getAttribute('href') ?? '';
  if (href.includes('/live/')) return true;
  if (item.querySelector('[class*="_is_live_"]')) return true;
  return /\bLIVE\b/i.test(item.textContent ?? '');
};

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const volumeRef = useRef(0);
  const lastNonZero = useRef(0.5);
  const pinnedRef = useRef(false);

  const [channelId, setChannelId] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [pinned, setPinned] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  // 저장된 볼륨 로드
  useEffect(() => {
    chrome.storage.local.get([PREVIEW_VOLUME], res => {
      if (typeof res[PREVIEW_VOLUME] === 'number') setVolume(res[PREVIEW_VOLUME]);
    });
  }, []);

  // 볼륨 변경 시 비디오에 즉시 반영
  useEffect(() => {
    volumeRef.current = volume;
    if (volume > 0) lastNonZero.current = volume;
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
    }
  }, [volume]);

  const persistVolume = (v: number) => {
    setVolume(v);
    chrome.storage.local.set({ [PREVIEW_VOLUME]: v });
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => persistVolume(Number(e.target.value));
  const toggleMute = () => persistVolume(volume > 0 ? 0 : lastNonZero.current);

  /* ── 표시/숨김 ─────────────────────────────────────────── */
  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    if (pinnedRef.current) return; // 핀 상태면 숨기지 않음
    cancelHide();
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      setTitle('');
      setChannelId('');
    }, 100);
  }, [cancelHide]);

  const togglePin = () => {
    setPinned(prev => {
      const next = !prev;
      if (next) cancelHide();
      else scheduleHide();
      return next;
    });
  };

  // 헤더 드래그로 프리뷰를 화면 어디로든 이동
  const startMove = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    cancelHide();
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      container.style.left = `${ev.clientX - offsetX}px`;
      container.style.top = `${ev.clientY - offsetY}px`;
    };
    const onUp = () => {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── HLS 스트림 연결 ───────────────────────────────────── */
  useEffect(() => {
    if (!visible || !channelId || !videoRef.current) return;

    const video = videoRef.current;

    const applyVolume = () => {
      video.volume = volumeRef.current;
      video.muted = volumeRef.current === 0;
    };

    const startStream = async () => {
      video.poster = ''; // 이전 채널 썸네일 잔상 제거

      const detail = await getLiveDetail(channelId);
      // API 로 가져온 실제 방송 제목으로 헤더 갱신 (호버 툴팁은 즉시 표시되는 임시값)
      if (detail.title) setTitle(detail.title);
      // 영상 첫 프레임이 그려지기 전까지 썸네일을 poster 로 보여준다 (재생되면 자동으로 덮임)
      if (detail.thumbnail) video.poster = detail.thumbnail;

      const hlsUrl = detail.hlsUrl;
      if (!hlsUrl || !videoRef.current) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // PiP 대상에서 제외 (브라우저 PiP 버튼/우클릭 메뉴 노출 방지)
      video.disablePictureInPicture = true;

      // 자동재생이 보장되도록 일단 음소거로 시작한 뒤 저장된 볼륨 적용
      video.muted = true;

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(applyVolume).catch(logWarning);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video
          .play()
          .then(applyVolume)
          .catch(() => {});
      }
    };

    startStream().catch(logWarning);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = '';
    };
  }, [channelId, visible]);

  /* ── 좌측 사이드바 마우스 이벤트 (영속 #sidebar 에 위임) ── */
  useEffect(() => {
    const $sidebar = document.querySelector(SIDEBAR);
    if (!$sidebar) return;

    const navHoverListener = (event: Event) => {
      try {
        // 프리뷰는 #sidebar 의 자식이라, 프리뷰 위 이벤트가 여기로 버블링되어 숨김을 유발한다.
        // 프리뷰 내부에서 발생한 이벤트는 무시한다.
        if ((event.target as HTMLElement)?.closest?.('.czp-preview')) return;

        const anchor = (event.target as HTMLElement)?.closest?.('a');
        const href = anchor?.getAttribute('href');
        const channelID = href ? getChannelIDByUrl(href) : null;

        // 채널 링크가 아니면 (지연) 숨김. 핀 상태면 scheduleHide 가 무시한다.
        if (!anchor || !channelID) {
          scheduleHide();
          return;
        }

        if (!isLiveSidebarItem(event.target as HTMLElement)) {
          scheduleHide();
          return;
        }

        // const itemEl = (event.target as HTMLElement).closest('li');
        // const tip =
        //   itemEl?.querySelector('[class*="_tooltip_"] [class*="_text_"]')?.textContent?.trim() ||
        //   itemEl?.querySelector('[class*="_tooltip_"]')?.textContent?.trim() ||
        //   itemEl?.querySelector('[class*="_name_"] [class*="_text_"]')?.textContent?.trim() ||
        //   '';
        // setTitle(tip);

        // 핀/이동 중이어도 다른 채널 호버 시에는 원래 위치(링크 옆)로 되돌리고 채널을 전환한다.
        cancelHide();
        const rect = anchor.getBoundingClientRect();
        if (containerRef.current) {
          containerRef.current.style.left = 8 + rect.right + 'px';
          containerRef.current.style.top = rect.top + 'px';
        }

        setChannelId(channelID);
        setVisible(true);
      } catch (err) {
        logWarning(err);
      }
    };

    const onSidebarLeave = () => {
      if (!pinnedRef.current) scheduleHide();
    };

    $sidebar.addEventListener('mouseover', navHoverListener);
    $sidebar.addEventListener('mouseleave', onSidebarLeave);

    return () => {
      $sidebar.removeEventListener('mouseover', navHoverListener);
      $sidebar.removeEventListener('mouseleave', onSidebarLeave);
    };
  }, [cancelHide, scheduleHide]);

  return (
    <div
      className="czp-preview"
      ref={containerRef}
      style={{ display: visible ? 'block' : 'none' }}
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
    >
      <div className="czp-preview-header" onMouseDown={startMove}>
        <span className="czp-preview-move" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.6" />
            <circle cx="15" cy="6" r="1.6" />
            <circle cx="9" cy="12" r="1.6" />
            <circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="18" r="1.6" />
            <circle cx="15" cy="18" r="1.6" />
          </svg>
        </span>
        <span className="czp-preview-title" title={title}>
          {title}
        </span>
        <button
          type="button"
          className="czp-preview-pin"
          data-pinned={pinned}
          onClick={togglePin}
          onMouseDown={e => e.stopPropagation()}
          aria-label="고정"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 17v5" />
            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
          </svg>
        </button>
      </div>

      <video ref={videoRef} className="czp-preview-video" muted playsInline autoPlay disablePictureInPicture />

      <div className="czp-preview-controls">
        <button type="button" className="czp-preview-mute" onClick={toggleMute} aria-label="음소거 토글">
          {volume > 0 ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
        <input
          type="range"
          className="czp-preview-volume"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={onVolumeChange}
        />
        <span className="czp-preview-volume-label">{Math.round(volume * 100)}</span>
      </div>
    </div>
  );
}
