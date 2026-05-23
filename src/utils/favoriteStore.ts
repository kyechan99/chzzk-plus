/**
 * 즐겨찾기 그룹 데이터 store.
 *
 * 저장 구조 (FAVORITE_GROUPS):
 *   { groups: FavoriteGroup[] }
 *
 * 레거시 마이그레이션:
 *   v1.7.x 이전 데이터는 FAVORITE_STREAMER = JSON.stringify(string[]) 형태였음.
 *   FAVORITE_GROUPS 가 없고 FAVORITE_STREAMER 만 있을 때, 자동으로 "기본" 그룹으로 이주.
 *   레거시 키는 호환을 위해 함께 갱신해 둔다 (혹시 다른 코드가 참조할 경우 대비).
 */

import { FAVORITE_GROUPS, FAVORITE_STREAMER } from '../constants/storage';
import { DEFAULT_COLOR, DEFAULT_ICON_ID, FavoriteIconId, normalizeColor } from '../constants/favoriteIcons';
import { logWarning } from './log';

export interface FavoriteGroup {
  id: string;
  name: string;
  icon: FavoriteIconId;
  color: string;
  channelIds: string[];
}

export interface FavoriteData {
  groups: FavoriteGroup[];
}

const EMPTY: FavoriteData = { groups: [] };

const DEFAULT_GROUP_NAME = '기본';

export const createGroupId = (): string => {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * 임의의 raw 값을 안전하게 FavoriteData 로 파싱.
 * 검증 실패 시 빈 데이터 반환 (예외 던지지 않음).
 */
const parse = (raw: unknown): FavoriteData => {
  if (typeof raw !== 'string' || !raw) return { groups: [] };
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || !Array.isArray((obj as FavoriteData).groups)) {
      return { groups: [] };
    }
    const groups = ((obj as FavoriteData).groups || [])
      .filter((g): g is FavoriteGroup => {
        return (
          !!g &&
          typeof g.id === 'string' &&
          typeof g.name === 'string' &&
          typeof g.icon === 'string' &&
          Array.isArray(g.channelIds)
        );
      })
      .map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon as FavoriteIconId,
        // 기존 데이터에 color 가 없을 수 있어 normalize 로 폴백 처리.
        color: normalizeColor(g.color),
        channelIds: g.channelIds.filter((c): c is string => typeof c === 'string'),
      }));
    return { groups };
  } catch (err) {
    logWarning(err);
    return { groups: [] };
  }
};

const parseLegacy = (raw: unknown): string[] => {
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * 그룹 데이터를 읽고, 레거시 데이터만 있는 경우 자동 마이그레이션.
 * 마이그레이션 결과는 storage 에도 영속화한다.
 */
export const readFavoriteData = (): Promise<FavoriteData> => {
  return new Promise(resolve => {
    chrome.storage.local.get([FAVORITE_GROUPS, FAVORITE_STREAMER], res => {
      const data = parse(res[FAVORITE_GROUPS]);
      if (data.groups.length > 0) {
        resolve(data);
        return;
      }

      const legacy = parseLegacy(res[FAVORITE_STREAMER]);
      if (legacy.length === 0) {
        resolve(EMPTY);
        return;
      }

      // 레거시 → 기본 그룹으로 이주
      const migrated: FavoriteData = {
        groups: [
          {
            id: createGroupId(),
            name: DEFAULT_GROUP_NAME,
            icon: DEFAULT_ICON_ID,
            color: DEFAULT_COLOR,
            channelIds: Array.from(new Set(legacy)),
          },
        ],
      };
      writeFavoriteData(migrated)
        .then(() => resolve(migrated))
        .catch(err => {
          logWarning(err);
          resolve(migrated);
        });
    });
  });
};

/**
 * 그룹 데이터를 쓰고, 레거시 키도 동기화.
 */
export const writeFavoriteData = (data: FavoriteData): Promise<void> => {
  const allChannelIds = data.groups.flatMap(g => g.channelIds);
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        [FAVORITE_GROUPS]: JSON.stringify(data),
        [FAVORITE_STREAMER]: JSON.stringify(allChannelIds),
      },
      () => {
        const err = chrome.runtime.lastError;
        if (err) reject(err);
        else resolve();
      },
    );
  });
};

/**
 * storage onChanged 이벤트의 raw 값을 FavoriteData 로 파싱.
 * undefined/null/잘못된 형태는 모두 빈 데이터로 처리.
 */
export const parseFavoriteData = (raw: unknown): FavoriteData => parse(raw);

/**
 * 채널이 속한 그룹을 찾는다. 없으면 null.
 */
export const findGroupOfChannel = (data: FavoriteData, channelId: string): FavoriteGroup | null => {
  return data.groups.find(g => g.channelIds.includes(channelId)) ?? null;
};

/**
 * 채널을 특정 그룹에 추가. 다른 그룹에 있다면 그곳에서 제거 (1채널 = 1그룹 원칙).
 * 동일 그룹에 이미 있으면 no-op.
 */
export const assignChannelToGroup = (data: FavoriteData, channelId: string, groupId: string): FavoriteData => {
  const groups = data.groups.map(g => {
    if (g.id === groupId) {
      if (g.channelIds.includes(channelId)) return g;
      return { ...g, channelIds: [...g.channelIds, channelId] };
    }
    if (g.channelIds.includes(channelId)) {
      return { ...g, channelIds: g.channelIds.filter(c => c !== channelId) };
    }
    return g;
  });
  return { groups };
};

/**
 * 채널을 모든 그룹에서 제거 (즐겨찾기 해제).
 */
export const removeChannelFromAll = (data: FavoriteData, channelId: string): FavoriteData => {
  return {
    groups: data.groups.map(g =>
      g.channelIds.includes(channelId)
        ? { ...g, channelIds: g.channelIds.filter(c => c !== channelId) }
        : g,
    ),
  };
};

export const addGroup = (
  data: FavoriteData,
  name: string,
  icon: FavoriteIconId,
  color: string = DEFAULT_COLOR,
): FavoriteData => {
  return {
    groups: [
      ...data.groups,
      {
        id: createGroupId(),
        name: name.trim() || DEFAULT_GROUP_NAME,
        icon,
        color: normalizeColor(color),
        channelIds: [],
      },
    ],
  };
};

export const updateGroup = (
  data: FavoriteData,
  groupId: string,
  patch: Partial<Pick<FavoriteGroup, 'name' | 'icon' | 'color'>>,
): FavoriteData => {
  return {
    groups: data.groups.map(g =>
      g.id === groupId
        ? {
            ...g,
            ...(patch.name !== undefined ? { name: patch.name.trim() || g.name } : {}),
            ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
            ...(patch.color !== undefined ? { color: normalizeColor(patch.color) } : {}),
          }
        : g,
    ),
  };
};

export const deleteGroup = (data: FavoriteData, groupId: string): FavoriteData => {
  return { groups: data.groups.filter(g => g.id !== groupId) };
};
