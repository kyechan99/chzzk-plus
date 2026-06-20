import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

import { logWarning } from '../../../utils/log';
import { getChannelIDByUrl } from '../../../utils/channel';
import { getHlsUrl } from '../../../utils/stream';
import { SIDEBAR } from '../../../constants/class';

import './Preview.css';

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [channelId, setChannelId] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);

  // 채널 변경 시 HLS 스트림 연결
  useEffect(() => {
    if (!visible || !channelId || !videoRef.current) return;

    const video = videoRef.current;

    const startStream = async () => {
      const hlsUrl = await getHlsUrl(channelId);
      if (!hlsUrl || !videoRef.current) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(logWarning);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.play().catch(() => {});
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

  // 좌측 사이드바 마우스 이벤트 등록.
  // 특정 ul 에 직접 바인딩하면 사이드바가 리빌드될 때 리스너가 버려진 노드에 남아 동작하지
  // 않는다. 대신 영속적인 #sidebar 에 이벤트 위임(delegation)하여 내부 리스트가 다시
  // 그려져도 새 채널 링크에 그대로 반응하게 한다.
  useEffect(() => {
    const $sidebar = document.querySelector(SIDEBAR);
    if (!$sidebar) return;

    const hide = () => {
      setVisible(false);
      setChannelId('');
    };

    const navHoverListener = (event: Event) => {
      try {
        const anchor = (event.target as HTMLElement)?.closest?.('a');
        const href = anchor?.getAttribute('href');
        const channelID = href ? getChannelIDByUrl(href) : null;

        // 채널 링크가 아니면 숨김
        if (!anchor || !channelID) {
          hide();
          return;
        }

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

    $sidebar.addEventListener('mouseover', navHoverListener);
    $sidebar.addEventListener('mouseleave', hide);

    return () => {
      $sidebar.removeEventListener('mouseover', navHoverListener);
      $sidebar.removeEventListener('mouseleave', hide);
    };
  }, []);

  return (
    <div className="czp-preview" ref={containerRef} style={{ display: visible ? 'block' : 'none' }}>
      <video ref={videoRef} className="czp-preview-video" muted playsInline autoPlay />
    </div>
  );
}
