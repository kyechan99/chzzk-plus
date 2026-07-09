/**
 * 치지직 이모티콘(emoji-packs) 인덱스 유틸.
 * 검색 UI(ChatEmojiSearch)와 태그 모달(ChatEmojiTagModal)이 공용으로 사용한다.
 */
import { CHAT_EMOJI_TAGS } from '../constants/storage';

// === emoji-packs API 응답 타입 (사용하는 필드만 선언) ===
type Emoji = {
  emojiId: string;
  imageUrl: string;
};

type EmojiPack = {
  emojiPackId: string;
  emojiPackName: string;
  emojiPackLocked: boolean;
  emojiTier2Locked?: boolean;
  emojis: Emoji[];
  tier2Emojis?: Emoji[] | null;
};

type EmojiPacksContent = {
  emojiPacks: EmojiPack[];
  cheatKeyEmojiPacks: EmojiPack[];
  subscriptionEmojiPacks: EmojiPack[];
};

export type EmojiIndexItem = {
  emojiId: string;
  imageUrl: string;
  packId: string;
  packName: string;
};

// 이모티콘별 사용자 태그. storage(CHAT_EMOJI_TAGS)에 저장되는 형태.
export type EmojiTags = Record<string, string[]>;

// 기본 태그 (치지직 기본 팩 대상). 최초 실행 시 1회 시드된다.
const DEFAULT_EMOJI_TAGS: EmojiTags = {
  d_139: ['ㅎㅇ'],
  d_41: ['ㅎㅇ'],
  d_11: ['ㅎㅇ'],
  d_65: ['ㅋㅋ'],
  d_44: ['ㅋㅋ'],
  d_15: ['ㅋㅋ'],
  d_123: ['?'],
  d_73: ['?'],
  d_67: ['?'],
  d_59: ['춤'],
  d_46: ['춤'],
  d_42: ['춤'],
};

/**
 * 저장된 태그를 불러온다. 저장소에 키 자체가 없으면(최초 실행) 기본 태그를 시드.
 * 사용자가 태그를 전부 지운 상태({})는 undefined 와 구분되므로 다시 시드하지 않는다.
 */
export const loadEmojiTags = (): Promise<EmojiTags> =>
  new Promise(resolve => {
    chrome.storage.local.get([CHAT_EMOJI_TAGS], res => {
      const stored = res[CHAT_EMOJI_TAGS] as EmojiTags | undefined;

      if (stored === undefined) {
        chrome.storage.local.set({ [CHAT_EMOJI_TAGS]: DEFAULT_EMOJI_TAGS });
        resolve(DEFAULT_EMOJI_TAGS);
        return;
      }
      resolve(stored);
    });
  });

/**
 * emoji-packs API 로 검색 인덱스를 만든다.
 * - 3개 팩 배열(기본/치트키/구독)을 병합
 * - 잠긴 팩(미구독), tier2 잠금 이모티콘은 사용할 수 없으므로 제외
 */
const fetchEmojiIndex = async (channelId: string): Promise<EmojiIndexItem[]> => {
  const res = await fetch(`https://api.chzzk.naver.com/service/v1/channels/${channelId}/emoji-packs`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`emoji-packs HTTP ${res.status}`);

  const { content } = (await res.json()) as { content: EmojiPacksContent };
  const packs = [...content.emojiPacks, ...content.cheatKeyEmojiPacks, ...content.subscriptionEmojiPacks];

  return packs.flatMap(pack => {
    if (pack.emojiPackLocked) return [];

    const lockedTier2 = new Set((pack.emojiTier2Locked ? (pack.tier2Emojis ?? []) : []).map(e => e.emojiId));

    return pack.emojis
      .filter(e => !lockedTier2.has(e.emojiId))
      .map(e => ({
        emojiId: e.emojiId,
        imageUrl: e.imageUrl,
        packId: pack.emojiPackId,
        packName: pack.emojiPackName,
      }));
  });
};

// 채널별 인덱스 캐시 — 검색 UI 와 태그 모달이 각자 마운트될 때마다 재요청하지 않도록 Promise 자체를 캐시.
const indexCache = new Map<string, Promise<EmojiIndexItem[]>>();

export const getEmojiIndex = (channelId: string): Promise<EmojiIndexItem[]> => {
  const cached = indexCache.get(channelId);
  if (cached) return cached;

  const fresh = fetchEmojiIndex(channelId).catch(err => {
    indexCache.delete(channelId); // 실패는 캐시하지 않음 → 다음 시도에서 재요청
    throw err;
  });
  indexCache.set(channelId, fresh);
  return fresh;
};
