import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAT_EMOJI_AREA, CHAT_EMOJI_SEARCH_ROOT_CLASS, EMOJI_PACK_TAB_ID_PREFIX } from '../../constants/class';
import { getChannelIDByUrl } from '../../utils/channel';
import { dispatchMouseClickSequence } from '../../utils/dom';
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
  dispatchMouseClickSequence($tabBtn);

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
  // 키보드(Tab/방향키)로 선택된 결과 인덱스. -1 = 선택 없음
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  // 마운트 = 팝업 열림 → 검색창 자동 포커스 (바로 타이핑 시작 가능)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  // TODO: 태그 검색 - 현재는 치지직 API 에서 제공하는 emojiId, packName 으로만(휴먼리더블x) 검색 가능.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return index
      .filter(e => e.emojiId.toLowerCase().includes(q) || e.packName.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [query, index]);

  // 검색어가 바뀌면 선택 초기화
  useEffect(() => {
    setSelected(-1);
  }, [query]);

  // 선택된 항목이 그리드 스크롤 밖이면 보이게
  useEffect(() => {
    if (selected < 0) return;
    document.querySelector('.czp-emoji-search-item--selected')?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  // 그리드의 현재 열 수 (auto-fill 이라 컨테이너 폭에 따라 변함 → 키 입력 시점에 계산)
  const getColumnCount = (): number => {
    if (!gridRef.current) return 1;
    return getComputedStyle(gridRef.current).gridTemplateColumns.split(' ').length;
  };

  // 선택 인덱스를 delta 만큼 이동 (범위는 clamp — Tab 순환과 달리 그리드 끝에서 멈추는 게 자연스러움)
  const moveSelection = (delta: number): void => {
    setSelected(prev => {
      if (prev === -1) return delta > 0 ? 0 : results.length - 1; // 첫 진입
      return Math.min(Math.max(prev + delta, 0), results.length - 1);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 치지직 전역 단축키(채팅 포커스 등)와 충돌 방지
    e.stopPropagation();

    if (results.length === 0) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return; // OS 단축키 조합은 건드리지 않음

    if (e.key === 'Tab') {
      // 포커스는 검색창에 유지한 채 선택만 순환 (Shift+Tab 역방향)
      e.preventDefault();
      const delta = e.shiftKey ? -1 : 1;
      setSelected(prev => (prev + delta + results.length) % results.length);
      return;
    }

    // ←→ 는 선택이 활성화된 뒤에만 그리드 이동 (그 전에는 검색어 캐럿 이동에 양보)
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selected >= 0) {
      e.preventDefault();
      moveSelection(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }

    // ↑↓ 는 항상 그리드 이동 (한 줄 input 이라 캐럿 용도 없음). 이동량 = 현재 열 수
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const columns = getColumnCount();
      moveSelection(e.key === 'ArrowDown' ? columns : -columns);
      return;
    }

    if (e.key === 'Enter' && selected >= 0 && results[selected]) {
      e.preventDefault();
      insertEmoji(results[selected]);
    }
  };

  return (
    <div>
      <strong className="czp-emoji-search-header">이모티콘 검색</strong>
      <input
        ref={inputRef}
        className="czp-emoji-search-input"
        type="text"
        placeholder={failed ? '이모티콘 목록을 불러오지 못했어요' : '이모티콘 검색'}
        disabled={failed}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {query.trim() !== '' && (
        <ul ref={gridRef} className="czp-emoji-search-results">
          {results.length === 0 ? (
            <li className="czp-emoji-search-empty">검색 결과가 없어요</li>
          ) : (
            results.map((e, i) => (
              <li key={e.emojiId}>
                <button
                  type="button"
                  className={`czp-emoji-search-item${i === selected ? ' czp-emoji-search-item--selected' : ''}`}
                  title={`${e.emojiId} · ${e.packName}`}
                  onClick={() => insertEmoji(e)}
                  // 버튼이 포커스를 뺏지 않게 → 검색창 포커스 유지, 클릭 후 Enter 재입력 방지
                  onMouseDown={e => e.preventDefault()}
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
