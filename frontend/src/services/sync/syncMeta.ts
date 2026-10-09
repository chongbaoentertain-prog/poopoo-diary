import { generateSaveCode } from './saveCode';

/** 同步层自己的状态,和业务存档分开存,互不影响 */
export interface SyncMeta {
  saveCode: string;
  lastServerTime: string | null; // 上次成功同步时服务器的时间,下次只拉它之后的变动
  pushedCheckInIds: string[]; // 已经推上去的签到记录 id,避免重复推
  pushedProfileUpdatedAt: number | null; // 已推送的资料版本
  pushedProgressSignature: string; // 已推送的角色进度签名,没变就不用再推
  hasPendingClear: boolean; // 离线时点了「清空全部数据」,联网后先通知服务器
  hasAcknowledgedSaveCode: boolean; // 用户已经看过/复制过存档码,不再提醒
}

export interface SyncMetaStore {
  load(): SyncMeta;
  save(syncMeta: SyncMeta): void;
}

export const createInitialSyncMeta = (saveCode = generateSaveCode()): SyncMeta => ({
  saveCode,
  lastServerTime: null,
  pushedCheckInIds: [],
  pushedProfileUpdatedAt: null,
  pushedProgressSignature: '',
  hasPendingClear: false,
  hasAcknowledgedSaveCode: false,
});

const STORAGE_KEY = 'poopoo-diary:sync:v1';

/**
 * 字段改名之前存下的旧格式(code / pushedIds / pushedProfileAt / pushedProgress / pendingClear / codeAcknowledged)。
 * 已经在用的用户 localStorage 里是这些名字,必须能读,否则会丢掉存档码、和云端数据断开。
 */
interface LegacySyncMeta {
  code: string;
  lastServerTime: string | null;
  pushedIds: string[];
  pushedProfileAt: number | null;
  pushedProgress: string;
  pendingClear: boolean;
  codeAcknowledged: boolean;
}

function parseStoredSyncMeta(storedValue: unknown): SyncMeta | null {
  const stored = storedValue as Partial<SyncMeta> & Partial<LegacySyncMeta>;
  const saveCode = stored?.saveCode ?? stored?.code;
  if (typeof saveCode !== 'string') return null;
  return {
    saveCode,
    lastServerTime: stored.lastServerTime ?? null,
    pushedCheckInIds: stored.pushedCheckInIds ?? stored.pushedIds ?? [],
    pushedProfileUpdatedAt: stored.pushedProfileUpdatedAt ?? stored.pushedProfileAt ?? null,
    pushedProgressSignature: stored.pushedProgressSignature ?? stored.pushedProgress ?? '',
    hasPendingClear: stored.hasPendingClear ?? stored.pendingClear ?? false,
    hasAcknowledgedSaveCode: stored.hasAcknowledgedSaveCode ?? stored.codeAcknowledged ?? false,
  };
}

export const localStorageSyncMetaStore: SyncMetaStore = {
  load() {
    try {
      const rawText = localStorage.getItem(STORAGE_KEY);
      const parsed = rawText ? parseStoredSyncMeta(JSON.parse(rawText)) : null;
      if (parsed) return parsed;
    } catch { /* 损坏或被禁用:当作首次启动 */ }
    const initialSyncMeta = createInitialSyncMeta();
    localStorageSyncMetaStore.save(initialSyncMeta);
    return initialSyncMeta;
  },
  save(syncMeta) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(syncMeta)); } catch { /* 配额满/隐私模式 */ }
  },
};

/** 测试用:放在内存里 */
export function createMemorySyncMetaStore(initialSyncMeta: SyncMeta = createInitialSyncMeta()): SyncMetaStore {
  let savedSyncMeta = initialSyncMeta;
  return {
    load: () => structuredClone(savedSyncMeta),
    save: (syncMeta) => { savedSyncMeta = structuredClone(syncMeta); },
  };
}
