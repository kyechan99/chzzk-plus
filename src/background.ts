import { PREVIEW_ENABLE, GUARD_ENALBE, CHAT_STORAGE_ENABLE, FAVORITE_ENABLE } from './constants/storage';

const defaultValues: Record<string, unknown> = {
  [PREVIEW_ENABLE]: true,
  [GUARD_ENALBE]: true,
  [CHAT_STORAGE_ENABLE]: true,
  [FAVORITE_ENABLE]: true,
};

chrome.runtime.onMessage.addListener(message => {
  if (message?.type === 'czp-open-tab' && typeof message.url === 'string') {
    chrome.tabs.create({ url: message.url, active: message.active !== false });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(Object.keys(defaultValues), result => {
    const valuesToSet = Object.entries(defaultValues).reduce(
      (acc, [key, value]) => {
        if (result[key] === undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    if (Object.keys(valuesToSet).length > 0) {
      chrome.storage.local.set(valuesToSet);
    }
  });
});
