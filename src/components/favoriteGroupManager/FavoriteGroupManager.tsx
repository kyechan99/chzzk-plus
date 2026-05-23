import { useEffect, useState } from 'react';
import {
  FavoriteData,
  addGroup,
  deleteGroup,
  parseFavoriteData,
  readFavoriteData,
  updateGroup,
  writeFavoriteData,
} from '../../utils/favoriteStore';
import { FAVORITE_GROUPS } from '../../constants/storage';
import {
  DEFAULT_COLOR,
  DEFAULT_ICON_ID,
  FAVORITE_COLORS,
  FAVORITE_ICONS,
  FavoriteIconId,
} from '../../constants/favoriteIcons';
import FavoriteIcon from '../icon/FavoriteIcon';
import { logWarning } from '../../utils/log';
import './FavoriteGroupManager.css';

export default function FavoriteGroupManager() {
  const [data, setData] = useState<FavoriteData>({ groups: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newIcon, setNewIcon] = useState<FavoriteIconId>(DEFAULT_ICON_ID);
  const [newColor, setNewColor] = useState<string>(DEFAULT_COLOR);

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

  const persist = (next: FavoriteData) => {
    setData(next);
    writeFavoriteData(next).catch(logWarning);
  };

  const startRename = (id: string, current: string) => {
    setEditingId(id);
    setEditingName(current);
    setIconPickerFor(null);
    setColorPickerFor(null);
  };

  const commitRename = () => {
    if (!editingId) return;
    persist(updateGroup(data, editingId, { name: editingName }));
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string, name: string, count: number) => {
    const msg =
      count > 0
        ? `"${name}" 그룹을 삭제하시겠어요?\n이 그룹의 즐겨찾기 채널 ${count}개가 함께 해제됩니다.`
        : `"${name}" 그룹을 삭제하시겠어요?`;
    if (!window.confirm(msg)) return;
    persist(deleteGroup(data, id));
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    persist(addGroup(data, name, newIcon, newColor));
    setNewName('');
    setNewIcon(DEFAULT_ICON_ID);
    setNewColor(DEFAULT_COLOR);
    setCreating(false);
  };

  return (
    <div className="czp-fav-mgr">
      <ul className="czp-fav-mgr-list">
        {data.groups.length === 0 && !creating && (
          <li className="czp-fav-mgr-empty">아직 그룹이 없습니다. 라이브 페이지의 즐겨찾기 버튼이나 아래에서 추가하세요.</li>
        )}
        {data.groups.map(g => {
          const isEditing = editingId === g.id;
          const showIconPicker = iconPickerFor === g.id;
          const showColorPicker = colorPickerFor === g.id;
          return (
            <li key={g.id} className="czp-fav-mgr-item">
              <div className="czp-fav-mgr-row">
                <button
                  type="button"
                  className="czp-fav-mgr-icon"
                  title="아이콘 변경"
                  style={{ background: g.color, color: '#fff', borderColor: 'transparent' }}
                  onClick={() => {
                    setIconPickerFor(showIconPicker ? null : g.id);
                    setColorPickerFor(null);
                  }}
                >
                  <FavoriteIcon id={g.icon} size={18} />
                </button>
                <button
                  type="button"
                  className="czp-fav-mgr-color-chip"
                  title="색상 변경"
                  style={{ background: g.color }}
                  onClick={() => {
                    setColorPickerFor(showColorPicker ? null : g.id);
                    setIconPickerFor(null);
                  }}
                />

                {isEditing ? (
                  <input
                    className="czp-fav-mgr-name-input"
                    value={editingName}
                    maxLength={20}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingName('');
                      }
                    }}
                    onBlur={commitRename}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="czp-fav-mgr-name"
                    onClick={() => startRename(g.id, g.name)}
                    title="이름 변경"
                  >
                    {g.name}
                  </button>
                )}

                <span className="czp-fav-mgr-count">{g.channelIds.length}</span>
                <button
                  type="button"
                  className="czp-fav-mgr-delete"
                  onClick={() => handleDelete(g.id, g.name, g.channelIds.length)}
                  title="그룹 삭제"
                >
                  ✕
                </button>
              </div>
              {showIconPicker && (
                <div className="czp-fav-mgr-picker">
                  {FAVORITE_ICONS.map(icon => (
                    <button
                      key={icon.id}
                      type="button"
                      title={icon.label}
                      className={`czp-fav-mgr-picker-item ${g.icon === icon.id ? 'is-selected' : ''}`}
                      onClick={() => {
                        persist(updateGroup(data, g.id, { icon: icon.id }));
                        setIconPickerFor(null);
                      }}
                    >
                      <FavoriteIcon id={icon.id} size={18} />
                    </button>
                  ))}
                </div>
              )}
              {showColorPicker && (
                <div className="czp-fav-mgr-color-row">
                  {FAVORITE_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      className={`czp-fav-mgr-color-option ${g.color === color ? 'is-selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => {
                        persist(updateGroup(data, g.id, { color }));
                        setColorPickerFor(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {!creating ? (
        <button
          type="button"
          className="czp-fav-mgr-add-btn"
          onClick={() => setCreating(true)}
        >
          + 새 그룹
        </button>
      ) : (
        <div className="czp-fav-mgr-create">
          <input
            className="czp-fav-mgr-name-input"
            placeholder="그룹 이름"
            value={newName}
            maxLength={20}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setCreating(false);
            }}
            autoFocus
          />
          <div className="czp-fav-mgr-picker">
            {FAVORITE_ICONS.map(icon => (
              <button
                key={icon.id}
                type="button"
                title={icon.label}
                className={`czp-fav-mgr-picker-item ${newIcon === icon.id ? 'is-selected' : ''}`}
                style={newIcon === icon.id ? { color: newColor, borderColor: newColor } : undefined}
                onClick={() => setNewIcon(icon.id)}
              >
                <FavoriteIcon id={icon.id} size={18} />
              </button>
            ))}
          </div>
          <div className="czp-fav-mgr-color-row">
            {FAVORITE_COLORS.map(color => (
              <button
                key={color}
                type="button"
                title={color}
                className={`czp-fav-mgr-color-option ${newColor === color ? 'is-selected' : ''}`}
                style={{ background: color }}
                onClick={() => setNewColor(color)}
              />
            ))}
          </div>
          <div className="czp-fav-mgr-create-actions">
            <button type="button" className="czp-fav-mgr-add-btn" onClick={() => setCreating(false)}>
              취소
            </button>
            <button
              type="button"
              className="czp-fav-mgr-add-btn is-primary"
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
