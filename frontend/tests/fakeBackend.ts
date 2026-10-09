import { OfflineError } from '../src/services/api/supabaseSyncApi';
import type { PushPayload, RemoteCheckIn, RemoteProfile, RemoteProgress, RemoteSnapshot, SyncBackend } from '../src/services/sync/syncTypes';

interface Row<T> { v: T; updatedAt: number; deleted: boolean; clearedAt?: number }
interface Vault {
  profile: RemoteProfile | null;
  profileBeforeClear: RemoteProfile | null;
  clearedAt: number | null;
  checkIns: Map<string, Row<RemoteCheckIn>>;
  progress: Map<string, Row<RemoteProgress>>;
}

/**
 * 内存版服务器,行为对齐 supabase/migrations/0001_sync.sql:
 * - 签到记录 on conflict do nothing(含已被清空标记的,避免复活)
 * - 角色进度:graduated 只会 false → true;被软删除的再次推送则恢复
 * - 资料后写者胜;清空 = 软删除全部行 + 记下 clearedAt
 * 真正的 SQL 没法在这里跑,所以这个对齐要靠人保证(改 SQL 时同步改这里)。
 */
export function createFakeBackend() {
  const vaults = new Map<string, Vault>();
  const ctl = { clock: 1_000_000, offline: false, calls: [] as string[] };
  const tick = () => (ctl.clock += 1000);
  const iso = (t: number) => new Date(t).toISOString();
  const guard = (fn: string) => {
    ctl.calls.push(fn);
    if (ctl.offline) throw new OfflineError('offline');
  };
  const vaultOf = (key: string, create: boolean): Vault | undefined => {
    if (!vaults.has(key) && create) vaults.set(key, { profile: null, profileBeforeClear: null, clearedAt: null, checkIns: new Map(), progress: new Map() });
    return vaults.get(key);
  };

  const backend: SyncBackend = {
    async pull(key, since): Promise<RemoteSnapshot> {
      guard('pull');
      const now = tick();
      const v = vaultOf(key, false);
      if (!v) return { profile: null, checkIns: [], progress: [], clearedAt: null, serverTime: iso(now) };
      const sinceMs = since ? Date.parse(since) : null;
      const pick = <T>(m: Map<string, Row<T>>) =>
        [...m.values()].filter((r) => (sinceMs === null ? !r.deleted : r.updatedAt > sinceMs)).map((r) => ({ ...r.v, deleted: r.deleted }));
      return { profile: v.profile, checkIns: pick(v.checkIns), progress: pick(v.progress), clearedAt: v.clearedAt ? iso(v.clearedAt) : null, serverTime: iso(now) };
    },

    async push(key, payload: PushPayload) {
      guard('push');
      const now = tick();
      const v = vaultOf(key, true)!;
      for (const c of payload.checkIns) if (!v.checkIns.has(c.id)) v.checkIns.set(c.id, { v: c, updatedAt: now, deleted: false });
      for (const p of payload.progress) {
        const cur = v.progress.get(p.characterId);
        if (!cur) v.progress.set(p.characterId, { v: p, updatedAt: now, deleted: false });
        else if (cur.deleted || (p.graduated && !cur.v.graduated)) v.progress.set(p.characterId, { v: { ...p, graduated: p.graduated || cur.v.graduated }, updatedAt: now, deleted: false });
      }
      if (payload.profile && (!v.profile || v.profile.updatedAt < payload.profile.updatedAt)) v.profile = payload.profile;
      return iso(now);
    },

    async clear(key) {
      guard('clear');
      const now = tick();
      const v = vaultOf(key, true)!;
      v.clearedAt = now;
      v.profileBeforeClear = v.profile;
      v.profile = null;
      for (const r of [...v.checkIns.values(), ...v.progress.values()]) if (!r.deleted) { r.deleted = true; r.updatedAt = now; r.clearedAt = now; }
      return iso(now);
    },

    async restore(key) {
      guard('restore');
      const now = tick();
      const v = vaultOf(key, false);
      if (!v || v.clearedAt === null) throw new Error('nothing to restore');
      if (v.clearedAt < now - 30 * 86_400_000) throw new Error('restore window expired');
      // 只恢复那一次清空删掉的行
      for (const r of [...v.checkIns.values(), ...v.progress.values()]) if (r.deleted && r.clearedAt === v.clearedAt) { r.deleted = false; r.updatedAt = now; }
      v.profile = v.profile ?? v.profileBeforeClear;
      v.profileBeforeClear = null;
      v.clearedAt = null;
      return iso(now);
    },
  };

  return { backend, ctl, vaults };
}
