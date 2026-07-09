import { useEffect, useMemo, useState } from 'react';
import { CHAT_EMOJI_TAG_MODAL, CHAT_EMOJI_TAG_QUERY, CHAT_EMOJI_TAGS } from '../../../constants/storage';
import { getChannelIDByUrl } from '../../../utils/channel';
import { getEmojiIndex, loadEmojiTags, type EmojiIndexItem, type EmojiTags } from '../../../utils/emoji';
import './ChatEmojiTagModal.css';

const saveTags = (tags: EmojiTags): void => {
  chrome.storage.local.set({ [CHAT_EMOJI_TAGS]: tags });
};

const TagEditor = () => {
  const [index, setIndex] = useState<EmojiIndexItem[]>([]);
  const [tags, setTags] = useState<EmojiTags>({});
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  // 인덱스(현재 채널) + 저장된 태그 로드
  useEffect(() => {
    const channelId = getChannelIDByUrl(document.URL);
    if (channelId) {
      getEmojiIndex(channelId)
        .then(setIndex)
        .catch(() => setIndex([]));
    }

    loadEmojiTags().then(setTags); // 최초 실행이면 기본 태그 시드
  }, []);

  const selectedEmoji = useMemo(() => index.find(e => e.emojiId === selectedEmojiId) ?? null, [index, selectedEmojiId]);

  // 저장된 전체 태그 목록 (중복 제거, 가나다순)
  const allTags = useMemo(() => [...new Set(Object.values(tags).flat())].sort(), [tags]);

  const updateTags = (next: EmojiTags): void => {
    setTags(next);
    saveTags(next);
  };

  const addTag = (): void => {
    const tag = tagInput.trim();
    if (!tag || !selectedEmojiId) return;

    const current = tags[selectedEmojiId] ?? [];
    if (!current.includes(tag)) {
      updateTags({ ...tags, [selectedEmojiId]: [...current, tag] });
    }
    setTagInput('');
  };

  const removeTag = (emojiId: string, tag: string): void => {
    const remain = (tags[emojiId] ?? []).filter(t => t !== tag);
    const next = { ...tags };

    if (remain.length === 0) {
      delete next[emojiId]; // 빈 배열은 키째로 정리
    } else {
      next[emojiId] = remain;
    }
    updateTags(next);
  };

  // 태그 chip 클릭 → 검색창에 검색어로 전달하고 모달 닫기
  const applyTagFilter = (tag: string): void => {
    chrome.storage.local.set({
      [CHAT_EMOJI_TAG_QUERY]: tag,
      [CHAT_EMOJI_TAG_MODAL]: false,
    });
  };

  return (
    <>
      <h2 className="czp-emoji-tag-heading">이모티콘 태그</h2>

      {allTags.length > 0 && (
        <div className="czp-emoji-tag-all">
          {allTags.map(tag => (
            <button key={tag} type="button" className="czp-emoji-tag-chip" onClick={() => applyTagFilter(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="czp-emoji-tag-desc">이모티콘을 선택하고 태그를 추가하세요. 태그는 검색에 사용됩니다.</p>

      <ul className="czp-emoji-tag-grid">
        {index.map(e => (
          <li key={e.emojiId}>
            <button
              type="button"
              className={`czp-emoji-tag-grid-item${e.emojiId === selectedEmojiId ? ' czp-emoji-tag-grid-item--selected' : ''}${tags[e.emojiId]?.length ? ' czp-emoji-tag-grid-item--tagged' : ''}`}
              title={`${e.emojiId} · ${e.packName}`}
              onClick={() => setSelectedEmojiId(e.emojiId)}
            >
              <img src={e.imageUrl} alt={e.emojiId} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      {selectedEmoji && (
        <div className="czp-emoji-tag-editor">
          <img src={selectedEmoji.imageUrl} alt={selectedEmoji.emojiId} />
          <div className="czp-emoji-tag-editor-body">
            <div className="czp-emoji-tag-editor-chips">
              {(tags[selectedEmoji.emojiId] ?? []).map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="czp-emoji-tag-chip"
                  title="클릭해서 삭제"
                  onClick={() => removeTag(selectedEmoji.emojiId, tag)}
                >
                  #{tag} ×
                </button>
              ))}
            </div>
            <input
              type="text"
              className="czp-emoji-tag-editor-input"
              placeholder="태그 입력 후 Enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') addTag();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// MESSAGE_STORAGE_MODAL 패턴: storage 플래그로 열림/닫힘 제어 (전역 마운트)
export default function ChatEmojiTagModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    chrome.storage.local.get([CHAT_EMOJI_TAG_MODAL], res => {
      setOpen(!!res[CHAT_EMOJI_TAG_MODAL]);
    });

    const onStorageChanged = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (CHAT_EMOJI_TAG_MODAL in changes) {
        setOpen(!!changes[CHAT_EMOJI_TAG_MODAL].newValue);
      }
    };
    chrome.storage.onChanged.addListener(onStorageChanged);
    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  const close = (): void => {
    chrome.storage.local.set({ [CHAT_EMOJI_TAG_MODAL]: false });
  };

  // createReactElement 시그니처가 () => JSX.Element 라서 null 대신 빈 프래그먼트 (MessageStorageModal 패턴)
  return (
    <>
      {open && (
        <div className="czp-emoji-tag-modal">
          <button type="button" className="czp-emoji-tag-modal-close" onClick={close}>
            ×
          </button>
          <TagEditor />
        </div>
      )}
    </>
  );
}
