import { getChannelIDByUrl } from './channel';

// 라이브 페이지 인지 확인
export const isLivePage = (): boolean => {
  return document.URL.includes('live/');
};

// 전체 라이브 페이지 인지 확인
export const isLiveListPage = (): boolean => {
  return document.URL.includes('lives');
};

// 비디오 페이지 인지 확인
export const isVideoPage = (): boolean => {
  return document.URL.includes('video/');
};

// 카테고리 페이지 인지 확인
export const isCategoryPage = (): boolean => {
  return document.URL.includes('category');
};

// 채널 홈(오프라인 포함) 페이지 인지 확인. 라이브/VOD 페이지는 제외.
export const isChannelPage = (): boolean => {
  if (isLivePage() || isVideoPage()) return false;
  return !!getChannelIDByUrl(document.URL);
};
