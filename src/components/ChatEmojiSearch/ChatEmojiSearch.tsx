import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAT_EMOJI_AREA, CHAT_EMOJI_SEARCH_ROOT_CLASS, EMOJI_PACK_TAB_ID_PREFIX } from '../../constants/class';
import { CHAT_EMOJI_TAG_MODAL, CHAT_EMOJI_TAG_QUERY, CHAT_EMOJI_TAGS } from '../../constants/storage';
import { getChannelIDByUrl } from '../../utils/channel';
import { dispatchMouseClickSequence } from '../../utils/dom';
import { getEmojiIndex, loadEmojiTags, type EmojiIndexItem, type EmojiTags } from '../../utils/emoji';
import './ChatEmojiSearch.css';

const MAX_RESULTS = 60;

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
  const [tags, setTags] = useState<EmojiTags>({});
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

    getEmojiIndex(channelId)
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);

  // 사용자 태그 로드 + 변경(태그 모달에서 편집) 실시간 반영,
  // 태그 chip 클릭(태그 모달) → 검색어로 적용 (일회성 키, 수신 후 삭제)
  useEffect(() => {
    loadEmojiTags().then(setTags); // 최초 실행이면 기본 태그 시드

    chrome.storage.local.get([CHAT_EMOJI_TAG_QUERY], res => {
      if (res[CHAT_EMOJI_TAG_QUERY]) {
        setQuery(res[CHAT_EMOJI_TAG_QUERY]);
        chrome.storage.local.remove(CHAT_EMOJI_TAG_QUERY);
        inputRef.current?.focus();
      }
    });

    const onStorageChanged = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (CHAT_EMOJI_TAGS in changes) {
        setTags(changes[CHAT_EMOJI_TAGS].newValue ?? {});
      }
      if (CHAT_EMOJI_TAG_QUERY in changes && changes[CHAT_EMOJI_TAG_QUERY].newValue) {
        setQuery(changes[CHAT_EMOJI_TAG_QUERY].newValue);
        chrome.storage.local.remove(CHAT_EMOJI_TAG_QUERY);
        inputRef.current?.focus();
      }
    };
    chrome.storage.onChanged.addListener(onStorageChanged);
    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return index
      .filter(
        e =>
          e.emojiId.toLowerCase().includes(q) ||
          e.packName.toLowerCase().includes(q) ||
          (tags[e.emojiId]?.some(tag => tag.toLowerCase().includes(q)) ?? false),
      )
      .slice(0, MAX_RESULTS);
  }, [query, index, tags]);

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

  // 키 → 선택 이동량.
  const deltaByKey: Record<string, (e: React.KeyboardEvent) => number> = {
    Tab: e => (e.shiftKey ? -1 : 1), // 포커스는 검색창에 유지한 채 선택만 이동
    ArrowLeft: () => -1,
    ArrowRight: () => 1,
    ArrowUp: () => -getColumnCount(), // ↑↓ 이동량 = 현재 열 수
    ArrowDown: () => getColumnCount(),
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 치지직 전역 단축키(채팅 포커스 등)와 충돌 방지

    if (results.length === 0) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return; // OS 단축키 조합은 건드리지 않음
    if (e.nativeEvent.isComposing) return; // 한글 IME 조합 중 키는 조합 로직에 양보 (Enter 이중 발화 방지)

    // 선택 없이 엔터 시 기본 동작 허용
    if (e.key === 'Enter' && (selected < 0 || !results[selected])) return;

    // ←→ 는 선택이 활성화된 뒤에만 그리드 이동 (그 전에는 검색어 캐럿 이동에 양보)
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selected < 0) return;

    const isEnter = e.key === 'Enter';
    const getDelta = deltaByKey[e.key];
    // 처리 대상이 아닌 키는 기본 동작(문자 입력, Backspace 등)에 양보 — preventDefault 전에 판정해야 함
    if (!isEnter && !getDelta) return;

    e.stopPropagation();
    e.preventDefault();

    if (isEnter) {
      insertEmoji(results[selected]);
    } else {
      moveSelection(getDelta(e));
    }
  };

  const openTagModal = (): void => {
    chrome.storage.local.set({ [CHAT_EMOJI_TAG_MODAL]: true });
  };

  return (
    <div className="czp-emoji-search">
      <strong className="czp-emoji-search-header">이모티콘 검색</strong>
      <div className="czp-emoji-search-input-wrap">
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
        <button
          type="button"
          className="czp-emoji-search-tag-btn"
          title="이모티콘 태그"
          onClick={openTagModal}
          // 검색창 포커스를 뺏지 않게
          onMouseDown={e => e.preventDefault()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
          </svg>
        </button>
      </div>
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
                  title={`${e.emojiId} · ${e.packName}${tags[e.emojiId]?.length ? ` · ${tags[e.emojiId].join(', ')}` : ''}`}
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
