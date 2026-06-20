import { useCallback, useEffect, useState } from 'react';
import { WEBPLAYER_VIDEO } from '../../../constants/class';
import {
  AUDIO_COMPRESSOR_AUTO,
  AUDIO_GAIN,
  AUDIO_PARAM_DEFAULTS,
  AUDIO_PARAM_KEYS,
  COMP_ATTACK,
  COMP_KNEE,
  COMP_RATIO,
  COMP_RELEASE,
  COMP_THRESHOLD,
} from '../../../constants/storage';
import './AudioCompressorButton.css';

// 오디오 그래프는 모듈 레벨로 유지한다.
// - 버튼이 remount 되거나 라이브를 이동해도 상태를 잃지 않는다.
// - 하나의 <video> 엘리먼트에는 createMediaElementSource 를 한 번만 호출할 수 있으므로,
//   동일 video 면 그래프를 재사용하고 새 video 면 새로 만든다.
let audioCtx: AudioContext | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let compNode: DynamicsCompressorNode | null = null;
let gainNode: GainNode | null = null;
let graphVideo: HTMLVideoElement | null = null;
let active = false;

type StorageRes = { [key: string]: number | undefined };
const param = (res: StorageRes, key: string): number =>
  typeof res[key] === 'number' ? (res[key] as number) : AUDIO_PARAM_DEFAULTS[key];

const applyParams = (): void => {
  const ctx = audioCtx;
  if (!ctx) return;
  chrome.storage.local.get(AUDIO_PARAM_KEYS, (res: StorageRes) => {
    const now = ctx.currentTime;
    if (compNode) {
      compNode.threshold.setValueAtTime(param(res, COMP_THRESHOLD), now);
      compNode.knee.setValueAtTime(param(res, COMP_KNEE), now);
      compNode.ratio.setValueAtTime(param(res, COMP_RATIO), now);
      compNode.attack.setValueAtTime(param(res, COMP_ATTACK), now);
      compNode.release.setValueAtTime(param(res, COMP_RELEASE), now);
    }
    if (gainNode) gainNode.gain.setValueAtTime(param(res, AUDIO_GAIN), now);
  });
};

const ensureGraph = (video: HTMLVideoElement): boolean => {
  if (audioCtx && graphVideo === video) return true;

  // video 가 바뀌었으면 이전 컨텍스트 정리 후 새로 구성
  if (audioCtx && graphVideo !== video) {
    try {
      audioCtx.close();
    } catch {
      /* noop */
    }
    audioCtx = sourceNode = compNode = gainNode = null;
    active = false;
  }

  try {
    audioCtx = new AudioContext();
    sourceNode = audioCtx.createMediaElementSource(video);
    compNode = audioCtx.createDynamicsCompressor();
    gainNode = audioCtx.createGain();
    sourceNode.connect(audioCtx.destination);
    graphVideo = video;
    applyParams();
    return true;
  } catch {
    audioCtx = sourceNode = compNode = gainNode = null;
    return false;
  }
};

const setActive = (next: boolean): boolean => {
  const video = document.querySelector<HTMLVideoElement>(WEBPLAYER_VIDEO);
  if (!video) return active;
  if (!ensureGraph(video)) return active;

  audioCtx!.resume?.();

  if (next && !active) {
    // source → compressor → gain → destination
    sourceNode!.disconnect();
    sourceNode!.connect(compNode!);
    compNode!.connect(gainNode!);
    gainNode!.connect(audioCtx!.destination);
    applyParams();
    active = true;
  } else if (!next && active) {
    // 원래 경로로 복귀: source → destination
    try {
      sourceNode!.disconnect();
    } catch {
      /* noop */
    }
    try {
      compNode!.disconnect();
    } catch {
      /* noop */
    }
    try {
      gainNode!.disconnect();
    } catch {
      /* noop */
    }
    sourceNode!.connect(audioCtx!.destination);
    active = false;
  }

  return active;
};

export default function AudioCompressorButton() {
  const [acActive, setAcActive] = useState(active);

  // 설정 슬라이더 변경 시 실시간 반영
  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (AUDIO_PARAM_KEYS.some(key => key in changes)) applyParams();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // '항상 활성화' 옵션: 라이브 진입(버튼 마운트)마다 자동으로 켠다.
  useEffect(() => {
    chrome.storage.local.get([AUDIO_COMPRESSOR_AUTO], res => {
      if (!res[AUDIO_COMPRESSOR_AUTO] || active) return;

      setAcActive(setActive(true));

      // 자동재생 정책으로 컨텍스트가 suspended 면 첫 사용자 제스처에서 resume
      if (audioCtx && audioCtx.state === 'suspended') {
        const resume = () => audioCtx?.resume();
        window.addEventListener('pointerdown', resume, { once: true });
        window.addEventListener('keydown', resume, { once: true });
      }
    });
  }, []);

  const onClickHandler = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAcActive(setActive(!active));
  }, []);

  return (
    <button
      aria-label="오디오 압축"
      className="pzp-viewmode-button pzp-pc-viewmode-button pzp-pc__viewmode-button pzp-button"
      data-active={String(acActive)}
      onClick={onClickHandler}
    >
      <span className="pzp-button__tooltip pzp-button__tooltip--top czp-pzp-ac-button">오디오 압축</span>
      <span
        className={`pzp-ui-icon pzp-setting-button__icon czp-compressor-button ${acActive ? 'czp-compressor-active' : ''}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
