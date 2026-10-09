import { generateCode } from './saveCode';

/** 同步层自己的状态,和业务存档分开存,互不影响 */
export interface SyncMeta {
  code: string; // 存档码
  lastServerTime: string | null; // 上次成功同步时服务器的时间,下次只拉它之后的变动
  pushedIds: string[]; // 已经推上去的签到记录 id,避免重复推
  pushedProfileAt: number | null; // 已推送的资料版本
  pushedProgress: string; // 已推送的角色进度签名,没变就不用再推
  pendingClear: boolean; // 离线时点了「清空全部数据」,联网后先通知服务器
  codeAcknowledged: boolean; // 用户已经看过/复制过存档码,不再提醒
}

export interface MetaStore {
  load(): SyncMeta;
  save(meta: SyncMeta): void;
}

export const freshMeta = (code = generateCode()): SyncMeta => ({
  code, lastServerTime: null, pushedIds: [], pushedProfileAt: null, pushedProgress: '', pendingClear: false, codeAcknowledged: false,
});

const KEY = 'poopoo-diary:sync:v1';

export const localStorageMeta: MetaStore = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const m = JSON.parse(raw) as SyncMeta;
        if (typeof m.code === 'string' && Array.isArray(m.pushedIds)) return m;
      }
    } catch { /* 损坏或被禁用:当作首次启动 */ }
    const meta = freshMeta();
    localStorageMeta.save(meta);
    return meta;
  },
  save(meta) {
    try { localStorage.setItem(KEY, JSON.stringify(meta)); } catch { /* 配额满/隐私模式 */ }
  },
};

export function createMemoryMeta(initial: SyncMeta = freshMeta()): MetaStore {
  let m = initial;
  return { load: () => structuredClone(m), save: (x) => { m = structuredClone(x); } };
}
