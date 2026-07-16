import {
  PREVIEW_ENABLE,
  GUARD_ENALBE,
  CHAT_STORAGE_ENABLE,
  FAVORITE_ENABLE,
  LAYOUT_CUSTOM_ENABLE,
  BUFFER_DISPLAY_ENABLE,
  AUDIO_COMPRESSOR,
  AUDIO_COMPRESSOR_AUTO,
  FAST_BUTTON,
  CHAT_EMOJI_SEARCH_ENABLE,
  CHAT_TIMESTAMP_FORMAT,
  CHAT_TIMESTAMP_FORMAT_DEFAULT,
} from './constants/storage';

const defaultValues: Record<string, unknown> = {
  [PREVIEW_ENABLE]: true,
  [GUARD_ENALBE]: true,
  [CHAT_STORAGE_ENABLE]: true,
  [FAVORITE_ENABLE]: true,
  [LAYOUT_CUSTOM_ENABLE]: true,
  [BUFFER_DISPLAY_ENABLE]: true,
  [AUDIO_COMPRESSOR]: true,
  [AUDIO_COMPRESSOR_AUTO]: true,
  [FAST_BUTTON]: true,
  [CHAT_EMOJI_SEARCH_ENABLE]: true,
  [CHAT_TIMESTAMP_FORMAT]: CHAT_TIMESTAMP_FORMAT_DEFAULT,
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
