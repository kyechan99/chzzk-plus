/**
 * 즐겨찾기 버튼(FavoriteButton) 마운트 공통 로직.
 *
 * 원래 live.ts 안에만 있던 로직이었으나, 라이브 방송 중인 페이지에서만 즐겨찾기 버튼이
 * 노출되어 오프라인 채널/VOD 페이지에서는 즐겨찾기를 추가할 방법이 없는 문제가 있었다.
 * 채널 홈(channel.ts), VOD(video.ts) 페이지에서도 동일하게 재사용할 수 있도록 분리.
 */
import { createReactElement } from './dom';
import FavoriteButton from '../components/button/FavoriteButton/FavoriteButton';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { getChannelIDByUrl } from './channel';

export const FAVORITE_ROOT_ID = 'chzzk-plus-favorite-btn';
type ReactComponent = () => JSX.Element;

export const mountReactRoot = (
  parent: Element | null,
  id: string,
  Component: ReactComponent,
  place: 'prepend' | 'append' = 'prepend',
): Element | null => {
  if (!parent) return null;

  const existing = document.getElementById(id);
  if (existing && parent.contains(existing)) return existing;
  existing?.remove();

  const root = document.createElement('div');
  root.id = id;
  parent[place](root);
  createReactElement(root, Component);
  return root;
};

const isFollowing = (button: HTMLButtonElement): boolean => {
  const labels = [
    button.textContent,
    button.getAttribute('aria-label'),
    button.getAttribute('title'),
    button.getAttribute('data-tooltip'),
  ];
  return labels.some(label => /^(팔로잉|following)$/i.test((label ?? '').replace(/\s+/g, ' ').trim()));
};

let favoriteRoot: Root | null = null;
let favoriteContainer: Element | null = null;
let favoriteRoute = '';
let favoriteFollowButton: HTMLButtonElement | null = null;
let restoreParentStyle: (() => void) | null = null;
let activeRoute = '';
let activeEnabled = false;
let retryTimer: number | null = null;
const videoChannels = new Map<string, string>();
const videoRequests = new Map<string, number>();
const videoFailures = new Map<string, number>();
const MAX_VIDEO_ATTEMPTS = 3;
let visitGeneration = 0;

const findFollowButton = (channelId: string): HTMLButtonElement | null => {
  const content = document.querySelector('#layout-body') ?? document.querySelector('main');
  if (!content) return null;
  const buttons = Array.from(content.querySelectorAll<HTMLButtonElement>('button'));
  return (
    buttons.find(button => {
      if (button.closest('[id^="chzzk-plus-"], [id^="czp-"]')) return false;
      if (!isFollowing(button)) return false;
      // 라이브/VOD 헤더는 inner에 채널 링크와 control이 함께 존재한다.
      const control = button.closest('div[class*="_control_"]');
      const inner = control?.closest('div[class*="_inner_"]');
      const row = inner?.closest('div[class*="_row_"]');
      // 채널 홈은 follow/action/area 및 채널 썸네일 링크 구조를 사용한다.
      const homeFollow = button.closest('div[class*="_follow_"]');
      const homeArea = homeFollow?.closest('div[class*="_area_"]');
      const home = homeArea?.parentElement?.parentElement;
      const header =
        row && inner?.contains(control)
          ? inner
          : home?.matches('div[class*="_container_"]') && homeFollow?.closest('div[class*="_action_"]')
            ? home
            : null;
      if (!header || header.closest('aside, nav, [role="log"]')) return false;
      const identityArea = header === home ? homeArea?.querySelector(':scope > div[class*="_information_"]') : header;
      if (!identityArea) return false;
      const links = Array.from(identityArea.querySelectorAll<HTMLAnchorElement>('a[href]'));
      return links.some(link => {
        let url: URL;
        try {
          url = new URL(link.href, location.href);
        } catch {
          return false;
        }
        if (header === home) {
          // 채널 홈은 방송 상태와 무관하게 헤더의 프로필 링크로 채널을 확인한다.
          const profileId = url.pathname.match(/^\/profile\/([0-9a-f]{32})\/?$/i)?.[1];
          return url.origin === 'https://game.naver.com' && profileId?.toLowerCase() === channelId.toLowerCase();
        }
        return (
          url.origin === location.origin &&
          /^\/(?:live\/|channel\/)?[0-9a-f]{32}\/?$/i.test(url.pathname) &&
          getChannelIDByUrl(url.pathname).toLowerCase() === channelId.toLowerCase()
        );
      });
    }) ?? null
  );
};

const unmountFavorite = (): void => {
  favoriteRoot?.unmount();
  favoriteRoot = null;
  favoriteContainer?.remove();
  restoreParentStyle?.();
  restoreParentStyle = null;
  favoriteContainer = null;
  favoriteRoute = '';
  favoriteFollowButton = null;
};

export const removeFavoriteButton = (): void => {
  visitGeneration++;
  activeEnabled = false;
  activeRoute = '';
  videoFailures.clear();
  if (retryTimer !== null) window.clearTimeout(retryTimer);
  retryTimer = null;
  unmountFavorite();
};

const requestVideoChannel = (videoId: string, route: string): void => {
  const generation = visitGeneration;
  if (videoRequests.get(videoId) === generation || retryTimer !== null || (videoFailures.get(videoId) ?? 0) >= MAX_VIDEO_ATTEMPTS)
    return;
  videoRequests.set(videoId, generation);
  const controller = new AbortController();
  let timeout: number;
  const expired = new Promise<never>((_, reject) => {
    timeout = window.setTimeout(() => {
      controller.abort();
      reject(new Error('Video metadata timeout'));
    }, 30000);
  });
  const request = fetch(`https://api.chzzk.naver.com/service/v2/videos/${videoId}`, { signal: controller.signal }).then(
    response => {
      if (!response.ok) {
        throw Object.assign(new Error('Video metadata unavailable'), { status: response.status });
      }
      return response.json();
    },
  );
  Promise.race([request, expired])
    .then(data => {
      if (generation !== visitGeneration) return;
      const id = data?.content?.channel?.channelId;
      if (String(data?.content?.videoNo) !== videoId || typeof id !== 'string' || !/^[0-9a-f]{32}$/i.test(id)) {
        throw new Error('Invalid video metadata');
      }
      videoChannels.set(videoId, id);
      videoFailures.delete(videoId);
    })
    .catch((error: { status?: number }) => {
      if (generation !== visitGeneration) return;
      if (error?.status && error.status >= 400 && error.status < 500 && error.status !== 429)
        videoFailures.set(videoId, MAX_VIDEO_ATTEMPTS);
      const failures = Math.min(MAX_VIDEO_ATTEMPTS, (videoFailures.get(videoId) ?? 0) + 1);
      videoFailures.set(videoId, failures);
      if (failures < MAX_VIDEO_ATTEMPTS && activeEnabled && location.pathname === route && retryTimer === null) {
        retryTimer = window.setTimeout(() => {
          retryTimer = null;
          if (activeEnabled && location.pathname === route) ensureFavoriteButton(true);
        }, 2000);
      }
    })
    .finally(() => {
      window.clearTimeout(timeout);
      if (videoRequests.get(videoId) === generation) videoRequests.delete(videoId);
      if (generation === visitGeneration && activeEnabled && location.pathname === route && videoChannels.has(videoId)) ensureFavoriteButton(true);
    });
};

export const ensureFavoriteButton = (enabled: boolean): void => {
  const route = location.pathname;
  if (!enabled) {
    removeFavoriteButton();
    return;
  }
  if (activeRoute !== route || !activeEnabled) {
    visitGeneration++;
    videoFailures.clear();
    activeRoute = route;
    activeEnabled = true;
    if (retryTimer !== null) window.clearTimeout(retryTimer);
    retryTimer = null;
    unmountFavorite();
  }
  const video = route.match(/^\/video\/(\d+)\/?$/);
  const directChannel = route.match(/^\/(?:live\/|channel\/)?([0-9a-f]{32})\/?$/i)?.[1];
  const channelId = video ? videoChannels.get(video[1]) : directChannel;
  if (!channelId) {
    unmountFavorite();
    if (video) requestVideoChannel(video[1], route);
    return;
  }
  const followButton = findFollowButton(channelId);
  const parent = followButton?.parentElement;
  if (!parent) {
    unmountFavorite();
    return;
  }
  if (
    favoriteContainer &&
    parent.contains(favoriteContainer) &&
    favoriteContainer.getAttribute('data-channel-id') === channelId &&
    favoriteRoute === route &&
    favoriteFollowButton === followButton
  )
    return;
  unmountFavorite();
  const root = document.createElement('div');
  root.id = FAVORITE_ROOT_ID;
  root.setAttribute('data-channel-id', channelId);
  parent.prepend(root);
  favoriteContainer = root;
  favoriteRoute = route;
  favoriteFollowButton = followButton;
  favoriteRoot = createRoot(root);
  // A replaced native control invalidates open menus; remount instead of risking a stale write.
  const isCurrent = () =>
    location.pathname === route &&
    activeEnabled &&
    favoriteContainer === root &&
    root.isConnected &&
    findFollowButton(channelId) === followButton;
  favoriteRoot.render(React.createElement(FavoriteButton, { channelId, isCurrent }));
  const display = parent.style.getPropertyValue('display');
  const displayPriority = parent.style.getPropertyPriority('display');
  const gap = parent.style.getPropertyValue('gap');
  const gapPriority = parent.style.getPropertyPriority('gap');
  parent.style.setProperty('display', 'flex');
  parent.style.setProperty('gap', '6px');
  restoreParentStyle = () => {
    if (parent.style.display === 'flex') parent.style.setProperty('display', display, displayPriority);
    if (parent.style.gap === '6px') parent.style.setProperty('gap', gap, gapPriority);
  };
};
