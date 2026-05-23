import { useEffect, useMemo, useRef, useState } from 'react';
import { logWarning } from '../../../utils/log';
import './FavoriteButton.css';
import { FAVORITE_GROUPS } from '../../../constants/storage';
import { getChannelIDByUrl } from '../../../utils/channel';
import {
  FavoriteData,
  FavoriteGroup,
  addGroup,
  assignChannelToGroup,
  findGroupOfChannel,
  parseFavoriteData,
  readFavoriteData,
  removeChannelFromAll,
  writeFavoriteData,
} from '../../../utils/favoriteStore';
import FavoriteIcon from '../../icon/FavoriteIcon';
import {
  DEFAULT_COLOR,
  DEFAULT_ICON_ID,
  FAVORITE_COLORS,
  FAVORITE_ICONS,
  FavoriteIconId,
} from '../../../constants/favoriteIcons';

export default function FavoriteButton() {
  const [data, setData] = useState<FavoriteData>({ groups: [] });
  const [open, setOpen] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newIcon, setNewIcon] = useState<FavoriteIconId>(DEFAULT_ICON_ID);
  const [newColor, setNewColor] = useState<string>(DEFAULT_COLOR);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const channelId = useMemo(() => getChannelIDByUrl(window.location.href), []);
  const currentGroup: FavoriteGroup | null = useMemo(
    () => (channelId ? findGroupOfChannel(data, channelId) : null),
    [data, channelId],
  );

  useEffect(() => {
    let mounted = true;
    readFavoriteData()
      .then(d => mounted && setData(d))
      .catch(logWarning);

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[FAVORITE_GROUPS]) {
        setData(parseFavoriteData(changes[FAVORITE_GROUPS].newValue));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  // outside click 으로 드롭다운 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    // 다음 tick 에 등록 (현재 클릭 이벤트를 잡지 않도록)
    const timer = window.setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const persist = (next: FavoriteData) => {
    setData(next);
    writeFavoriteData(next).catch(logWarning);
  };

  const handleSelectGroup = (groupId: string) => {
    if (!channelId) return;
    persist(assignChannelToGroup(data, channelId, groupId));
    setOpen(false);
  };

  const handleUnfavorite = () => {
    if (!channelId) return;
    persist(removeChannelFromAll(data, channelId));
    setOpen(false);
  };

  const handleCreateGroup = () => {
    const name = newName.trim();
    if (!name) return;
    const withGroup = addGroup(data, name, newIcon, newColor);
    const newGroup = withGroup.groups[withGroup.groups.length - 1];
    const next = channelId ? assignChannelToGroup(withGroup, channelId, newGroup.id) : withGroup;
    persist(next);
    setCreating(false);
    setNewName('');
    setNewIcon(DEFAULT_ICON_ID);
    setNewColor(DEFAULT_COLOR);
    setOpen(false);
  };

  const toggleOpen = () => {
    setOpen(o => !o);
    setCreating(false);
  };

  return (
    <div className="czp-fav-wrapper" ref={wrapperRef}>
      <button
        className={`favorite-btn ${currentGroup ? 'favorited' : ''}`}
        onClick={toggleOpen}
        type="button"
      >
        <span
          className="czp-fav-icon-chip"
          style={currentGroup ? { background: currentGroup.color, color: '#fff' } : undefined}
        >
          <FavoriteIcon id={currentGroup?.icon ?? 'star'} size={12} />
        </span>
        <span>{currentGroup ? currentGroup.name : '즐겨찾기'}</span>
        <span className="czp-fav-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="czp-fav-dropdown" role="menu">
          {data.groups.length > 0 && (
            <ul className="czp-fav-group-list">
              {data.groups.map(g => (
                <li key={g.id}>
                  <button
                    type="button"
                    className={`czp-fav-group-item ${currentGroup?.id === g.id ? 'is-current' : ''}`}
                    onClick={() => handleSelectGroup(g.id)}
                  >
                    <span className="czp-fav-icon-chip" style={{ background: g.color, color: '#fff' }}>
                      <FavoriteIcon id={g.icon} size={12} />
                    </span>
                    <span className="czp-fav-group-name">{g.name}</span>
                    {currentGroup?.id === g.id && <span className="czp-fav-check">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!creating ? (
            <div className="czp-fav-actions">
              <button
                type="button"
                className="czp-fav-action-btn"
                onClick={() => setCreating(true)}
              >
                + 새 그룹
              </button>
              {currentGroup && (
                <button
                  type="button"
                  className="czp-fav-action-btn czp-fav-action-danger"
                  onClick={handleUnfavorite}
                >
                  즐겨찾기 해제
                </button>
              )}
            </div>
          ) : (
            <div className="czp-fav-create">
              <input
                type="text"
                className="czp-fav-input"
                placeholder="그룹 이름"
                value={newName}
                maxLength={20}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateGroup();
                  if (e.key === 'Escape') setCreating(false);
                }}
                autoFocus
              />
              <div className="czp-fav-icon-picker">
                {FAVORITE_ICONS.map(icon => (
                  <button
                    key={icon.id}
                    type="button"
                    title={icon.label}
                    className={`czp-fav-icon-option ${newIcon === icon.id ? 'is-selected' : ''}`}
                    style={newIcon === icon.id ? { color: newColor, borderColor: newColor } : undefined}
                    onClick={() => setNewIcon(icon.id)}
                  >
                    <FavoriteIcon id={icon.id} size={18} />
                  </button>
                ))}
              </div>
              <div className="czp-fav-color-picker">
                {FAVORITE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    className={`czp-fav-color-option ${newColor === color ? 'is-selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
              <div className="czp-fav-create-actions">
                <button
                  type="button"
                  className="czp-fav-action-btn"
                  onClick={() => setCreating(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="czp-fav-action-btn czp-fav-action-primary"
                  onClick={handleCreateGroup}
                  disabled={!newName.trim()}
                >
                  만들기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
