import { useEffect, useState } from 'react';

interface ReloadBannerProps {
  watchKeys: string[];
}

function isPopupContext() {
  return window.location.protocol === 'chrome-extension:';
}

function ReloadBanner({ watchKeys }: ReloadBannerProps) {
  const [needsReload, setNeedsReload] = useState(false);

  useEffect(() => {
    const watchSet = new Set(watchKeys);

    const handleChanged = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return;

      const hasRelevantChange = Object.keys(changes).some(key => watchSet.has(key));
      if (hasRelevantChange) {
        setNeedsReload(true);
      }
    };

    chrome.storage.onChanged.addListener(handleChanged);
    return () => chrome.storage.onChanged.removeListener(handleChanged);
  }, [watchKeys]);

  if (!needsReload) return null;

  const handleReload = () => {
    if (isPopupContext()) {
      // 팝업: 확장 프로그램이 동작 중인 활성 탭을 새로고침
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0]?.id;
        if (tabId !== undefined) {
          chrome.tabs.reload(tabId);
        }
        window.close();
      });
    } else {
      // 모달: 사이트에 직접 주입된 상태이므로 현재 페이지를 새로고침
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      onClick={handleReload}
      style={{
        position: 'absolute',
        bottom: '-60.8px',
        left: 0,
        width: '100%',
        height: '2.5rem',
        background: 'rgba(0, 255, 163, 0.9)',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#000',
        opacity: 0.8,
        zIndex: 10,
      }}
    >
      새로고침하여 설정 반영
    </button>
  );
}

export default ReloadBanner;
