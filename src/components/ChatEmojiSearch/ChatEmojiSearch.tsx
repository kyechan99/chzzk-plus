import { useEffect, useMemo, useState } from 'react';
import { CHAT_EMOJI_AREA, CHAT_EMOJI_SEARCH_ROOT_CLASS, EMOJI_PACK_TAB_ID_PREFIX } from '../../constants/class';
import { getChannelIDByUrl } from '../../utils/channel';
import './ChatEmojiSearch.css';

// === emoji-packs API 응답 타입 (사용하는 필드만 선언) ===
// API 를 사용한 fetch 는 EmojiSearch 에서만 사용되므로, 별도 api 모듈로 분리하지 않음
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

type EmojiIndexItem = {
  emojiId: string;
  imageUrl: string;
  packId: string;
  packName: string;
};

const MAX_RESULTS = 60;

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

// 팝업(#emoji_area) 안에서 해당 이모티콘의 네이티브 버튼을 찾는다.
// 우리 검색 UI 도 #emoji_area 안에 마운트되고 결과 img 의 alt 포맷이 동일하므로,
// 우리 루트(CHAT_EMOJI_SEARCH_ROOT_CLASS) 하위는 반드시 제외한다. (자기 클릭 → 무한 재귀 방지)
const findNativeEmojiButton = (emojiId: string): HTMLButtonElement | null => {
  const areaEmojis = [...document.querySelectorAll<HTMLImageElement>(`${CHAT_EMOJI_AREA} button img`)];

  const listedEmojis = areaEmojis.filter($img => !$img.closest(`.${CHAT_EMOJI_SEARCH_ROOT_CLASS}`));
  const matchedEmoji = listedEmojis.find($img => $img.alt === `{:${emojiId}:}`);
  return matchedEmoji?.closest('button') ?? null;
};

// 팩 탭 버튼은 click 이 아니라 mousedown/mouseup 에 핸들러가 걸려 있어 click() 으로는 전환되지 않는다.
// 실제 마우스 조작과 동일한 mousedown → mouseup 시퀀스를 디스패치한다. (실환경 검증됨)
const dispatchMouseDownUp = ($el: HTMLElement): void => {
  const base = { bubbles: true, cancelable: true, view: window, button: 0 };
  $el.dispatchEvent(new MouseEvent('mousedown', { ...base, buttons: 1 }));
  $el.dispatchEvent(new MouseEvent('mouseup', { ...base, buttons: 0 }));
};

/**
 * 네이티브 이모티콘 버튼에 click 을 디스패치해 치지직 자체 삽입 경로를 재사용한다.
 * 팩 탭 구조라 현재 탭에 없는 이모티콘은, 팩 탭(id: emoji_pack_id_{packId})을
 * 먼저 전환한 뒤 버튼이 렌더링되기를 기다렸다가 클릭한다.
 */
const insertEmoji = async ({ emojiId, packId }: EmojiIndexItem): Promise<void> => {
  // 1) 현재 탭에 이미 렌더링돼 있으면 바로 클릭
  const $btn = findNativeEmojiButton(emojiId);
  if ($btn) {
    $btn.click();
    return;
  }

  // 2) 해당 팩 탭으로 전환 후 재시도
  const $tabBtn = document.getElementById(`${EMOJI_PACK_TAB_ID_PREFIX}${packId}`);
  if (!$tabBtn) return;
  dispatchMouseDownUp($tabBtn);

  // 탭 전환 렌더링을 기다리며 재시도 (최대 1초)
  // waitingElement 는 셀렉터만 받아 우리 결과 img 를 구분할 수 없으므로, 제외 필터가 있는 finder 로 폴링한다.
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));

    const $retryBtn = findNativeEmojiButton(emojiId);
    if ($retryBtn) {
      $retryBtn.click();
      return;
    }
  }
};

export default function ChatEmojiSearch() {
  const [index, setIndex] = useState<EmojiIndexItem[]>([]);
  const [query, setQuery] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const channelId = getChannelIDByUrl(document.URL);
    if (!channelId) {
      setFailed(true);
      return;
    }

    fetchEmojiIndex(channelId)
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // TODO: 한글 초성 검색 (팩 이름 대상)
    return index
      .filter(e => e.emojiId.toLowerCase().includes(q) || e.packName.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [query, index]);

  return (
    <div>
      <strong className="czp-emoji-search-header">이모티콘 검색</strong>
      <input
        className="czp-emoji-search-input"
        type="text"
        placeholder={failed ? '이모티콘 목록을 불러오지 못했어요' : '이모티콘 검색'}
        disabled={failed}
        value={query}
        onChange={e => setQuery(e.target.value)}
        // 치지직 전역 단축키(채팅 포커스 등)와 충돌 방지
        onKeyDown={e => e.stopPropagation()}
      />
      {query.trim() !== '' && (
        <ul className="czp-emoji-search-results">
          {results.length === 0 ? (
            <li className="czp-emoji-search-empty">검색 결과가 없어요</li>
          ) : (
            results.map(e => (
              <li key={e.emojiId}>
                <button
                  type="button"
                  className="czp-emoji-search-item"
                  title={`${e.emojiId} · ${e.packName}`}
                  onClick={() => insertEmoji(e)}
                >
                  <img src={e.imageUrl} alt={`{:${e.emojiId}:}`} loading="lazy" />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
