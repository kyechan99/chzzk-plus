// 라이브 페이지 인지 확인
export const isLivePage = (): boolean => {
  return document.URL.includes("live/");
};
