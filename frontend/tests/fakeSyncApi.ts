import { NetworkUnavailableError } from '../src/services/api/supabaseSyncApi';
import type { PushPayload, RemoteCheckIn, RemoteProfile, RemoteProgress, RemoteSnapshot, SyncApi } from '../src/types/sync';

interface StoredRow<Data> {
  data: Data;
  updatedAtMs: number;
  isDeleted: boolean;
  deletedByClearAtMs?: number; // 是哪一次「清空」删掉的,恢复时只还原那一次
}

interface FakeVault {
  profile: RemoteProfile | null;
  profileBeforeClear: RemoteProfile | null;
  clearedAtMs: number | null;
  checkIns: Map<string, StoredRow<RemoteCheckIn>>;
  progress: Map<string, StoredRow<RemoteProgress>>;
}

const MILLISECONDS_PER_DAY = 86_400_000;
const RESTORE_WINDOW_MS = 30 * MILLISECONDS_PER_DAY;

/**
 * 内存版服务器,行为对齐 backend/supabase/migrations/0001_sync.sql:
 * - 签到记录 on conflict do nothing(含已被清空标记的,避免复活)
 * - 角色进度:graduated 只会 false → true;被软删除的再次推送则恢复
 * - 资料后写者胜;清空 = 软删除全部行 + 记下 clearedAt
 * 真正的 SQL 没法在这里跑,所以这个对齐要靠人保证(改 SQL 时同步改这里)。
 */
export function createFakeSyncApi() {
  const vaults = new Map<string, FakeVault>();
  const controls = {
    clockMs: 1_000_000, // 假服务器的时钟,每次请求前进 1 秒;测试可以直接拨快
    isOffline: false,
    calledFunctionNames: [] as string[],
  };

  const advanceClock = () => (controls.clockMs += 1000);
  const toIsoString = (timestampMs: number) => new Date(timestampMs).toISOString();
  const recordCall = (functionName: string) => {
    controls.calledFunctionNames.push(functionName);
    if (controls.isOffline) throw new NetworkUnavailableError('offline');
  };
  const findVault = (vaultKey: string, createIfMissing: boolean): FakeVault | undefined => {
    if (!vaults.has(vaultKey) && createIfMissing) {
      vaults.set(vaultKey, { profile: null, profileBeforeClear: null, clearedAtMs: null, checkIns: new Map(), progress: new Map() });
    }
    return vaults.get(vaultKey);
  };

  const api: SyncApi = {
    async pull(vaultKey, changedSince): Promise<RemoteSnapshot> {
      recordCall('pull');
      const nowMs = advanceClock();
      const vault = findVault(vaultKey, false);
      if (!vault) return { profile: null, checkIns: [], progress: [], clearedAt: null, serverTime: toIsoString(nowMs) };

      const changedSinceMs = changedSince ? Date.parse(changedSince) : null;
      const pickRows = <Data>(rows: Map<string, StoredRow<Data>>) =>
        [...rows.values()]
          .filter((row) => (changedSinceMs === null ? !row.isDeleted : row.updatedAtMs > changedSinceMs))
          .map((row) => ({ ...row.data, deleted: row.isDeleted }));

      return {
        profile: vault.profile,
        checkIns: pickRows(vault.checkIns),
        progress: pickRows(vault.progress),
        clearedAt: vault.clearedAtMs ? toIsoString(vault.clearedAtMs) : null,
        serverTime: toIsoString(nowMs),
      };
    },

    async push(vaultKey, payload: PushPayload) {
      recordCall('push');
      const nowMs = advanceClock();
      const vault = findVault(vaultKey, true)!;

      for (const checkIn of payload.checkIns) {
        if (!vault.checkIns.has(checkIn.id)) vault.checkIns.set(checkIn.id, { data: checkIn, updatedAtMs: nowMs, isDeleted: false });
      }
      for (const progress of payload.progress) {
        const existing = vault.progress.get(progress.characterId);
        if (!existing) {
          vault.progress.set(progress.characterId, { data: progress, updatedAtMs: nowMs, isDeleted: false });
        } else if (existing.isDeleted || (progress.graduated && !existing.data.graduated)) {
          vault.progress.set(progress.characterId, {
            data: { ...progress, graduated: progress.graduated || existing.data.graduated },
            updatedAtMs: nowMs,
            isDeleted: false,
          });
        }
      }
      if (payload.profile && (!vault.profile || vault.profile.updatedAt < payload.profile.updatedAt)) vault.profile = payload.profile;
      return toIsoString(nowMs);
    },

    async clear(vaultKey) {
      recordCall('clear');
      const nowMs = advanceClock();
      const vault = findVault(vaultKey, true)!;
      vault.clearedAtMs = nowMs;
      vault.profileBeforeClear = vault.profile;
      vault.profile = null;
      for (const row of [...vault.checkIns.values(), ...vault.progress.values()]) {
        if (row.isDeleted) continue;
        row.isDeleted = true;
        row.updatedAtMs = nowMs;
        row.deletedByClearAtMs = nowMs;
      }
      return toIsoString(nowMs);
    },

    async restore(vaultKey) {
      recordCall('restore');
      const nowMs = advanceClock();
      const vault = findVault(vaultKey, false);
      if (!vault || vault.clearedAtMs === null) throw new Error('nothing to restore');
      if (vault.clearedAtMs < nowMs - RESTORE_WINDOW_MS) throw new Error('restore window expired');

      for (const row of [...vault.checkIns.values(), ...vault.progress.values()]) {
        if (row.isDeleted && row.deletedByClearAtMs === vault.clearedAtMs) {
          row.isDeleted = false;
          row.updatedAtMs = nowMs;
        }
      }
      vault.profile = vault.profile ?? vault.profileBeforeClear;
      vault.profileBeforeClear = null;
      vault.clearedAtMs = null;
      return toIsoString(nowMs);
    },
  };

  return { api, controls, vaults };
}
