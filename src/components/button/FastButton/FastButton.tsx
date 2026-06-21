import React, { useState, useEffect, useCallback } from 'react';
import './FastButton.css';
import { WEBPLAYER_VIDEO } from '../../../constants/class';
import { isTypingTarget } from '../../../utils/dom';

const NORMAL_SPEED = 1;
const FASTER_SPEED = 2.0;
const SLOWER_SPEED = 0.5;

export default function FastButton() {
  // 현재 재생 속도 상태 관리 (기본값: 1)
  const [currentRate, setCurrentRate] = useState<number>(1);

  const slower = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    changePlaybackRate(SLOWER_SPEED);
  }, []);

  const normal = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    changePlaybackRate(NORMAL_SPEED);
  }, []);

  const faster = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    changePlaybackRate(FASTER_SPEED);
  }, []);

  // 빨리감기 버튼 클릭 / 단축키 입력 시 토글 처리
  const toggleFast = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault();
      // 현재 2배속 상태라면 1배속으로, 아니면 2배속으로 변경
      if (currentRate === FASTER_SPEED) {
        normal(e);
      } else {
        faster(e);
      }
    },
    [normal, faster, currentRate],
  );

  useEffect(() => {
    const captureEvent = (event: KeyboardEvent) => {
      const { target } = event;
      if (target instanceof HTMLElement) {
        if (!isTypingTarget(target) && !event.ctrlKey) {
          // ]: 빨리 감기 / 배속 토글
          if (event.key === ']' || event.key === '}') {
            faster();
          } else if (event.key === '[' || event.key === '{') {
            slower();
          } else if (event.key === '=' || event.key === '+') {
            normal();
          }
        }
      }
    };

    // 플레이어 단축키 활성화
    document.addEventListener('keydown', captureEvent);
    return () => {
      document.removeEventListener('keydown', captureEvent);
    };
  }, [currentRate, slower, normal, faster]); // currentRate가 바뀔 때 이벤트 리스너가 최신 상태를 참조하도록 설정

  // 비디오 배속을 실제로 변경하고 상태를 업데이트하는 공통 함수
  const changePlaybackRate = (rate: number) => {
    const video = document.querySelector(WEBPLAYER_VIDEO) as HTMLVideoElement;
    if (video) {
      video.playbackRate = rate;
      setCurrentRate(rate);
    }
  };

  const labelText = currentRate === 1 ? '빨리감기' : `배속 (${currentRate}x)`;

  return (
    <button
      className={`pzp-viewmode-button pzp-pc-viewmode-button pzp-pc__viewmode-button pzp-button ${
        currentRate !== 1 ? 'czp-fast-button--active' : ''
      }`}
      aria-label={labelText}
      aria-haspopup="true"
      onClick={toggleFast}
    >
      <span className="pzp-button__tooltip pzp-button__tooltip--top czp-pzp-fast-button">{labelText}</span>

      <span
        className="pzp-ui-icon pzp-setting-button__icon czp-fast-button"
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pzp-ui-icon__svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke="#FFF"
          fill="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
            strokeWidth="0"
            fill="currentColor"
          />
          <path
            d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z"
            strokeWidth="0"
            fill="currentColor"
          />
        </svg>

        {currentRate !== 1 && (
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFF', marginLeft: '2px' }}>{currentRate}x</span>
        )}
      </span>
    </button>
  );
}
