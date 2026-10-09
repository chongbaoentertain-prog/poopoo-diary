import { createStore } from 'zustand/vanilla';
import type { createAppStore } from '../../stores/createAppStore';
import type { CheckIn } from '../../types/diary';
import type { PushPayload, RemoteCheckIn, SyncApi } from '../../types/sync';
import { NetworkUnavailableError } from '../api/supabaseSyncApi';
import { hashSaveCodeToVaultKey, normalizeSaveCode } from './saveCode';
import { createInitialSyncMeta, type SyncMeta, type SyncMetaStore } from './syncMeta';

type AppStoreApi = ReturnType<typeof createAppStore>;

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncStatus {
  state: SyncState;
  lastSyncAt: number | null;
  errorMessage: string | null;
  saveCode: string;
  hasAcknowledgedSaveCode: boolean;
  clearedAt: string | null; // 云端最近一次清空的时间;30 天内可以恢复
}

export type OperationResult = { ok: true } | { ok: false; error: string };

export type CloudVerification =
  | { ok: true; checkInCount: number; characterCount: number; nickname: string | null }
  | { ok: false; error: string };

const MAX_CHECK_INS_PER_PUSH = 500; // 服务器单次最多收 1000 条,留一半余量
const DEFAULT_PULL_OVERLAP_MS = 60_000;
const PERIODIC_SYNC_INTERVAL_MS = 60_000;
const SYNC_DEBOUNCE_MS = 1500;
const NETWORK_ERROR_MESSAGE = '现在连不上服务器,请联网后再试';

/** 清空或换存档码之后,之前"已经推过什么"的记录全部作废 */
const FORGET_PUSHED_DATA = { pushedCheckInIds: [], pushedProfileUpdatedAt: null, pushedProgressSignature: '' } satisfies Partial<SyncMeta>;

const toRemoteCheckIn = (checkIn: CheckIn): RemoteCheckIn => ({
  id: checkIn.id,
  date: checkIn.date,
  at: checkIn.at,
  characterId: checkIn.characterId,
  stampId: checkIn.stampId,
  counted: checkIn.counted,
});

/**
 * 本地优先的同步引擎:页面永远读写本地存档,这里在后台把变动和云端对齐。
 * 每一轮:(先通知清空) → 拉取云端变动并合并 → 把本地新增的推上去。
 * 任何一步网络失败都只是"等下次",本地数据不受影响。
 */
export function createSyncEngine(options: {
  store: AppStoreApi;
  api: SyncApi;
  syncMetaStore: SyncMetaStore;
  now?: () => number;
  pullOverlapMs?: number;
}) {
  const { store, api, syncMetaStore, now = Date.now, pullOverlapMs = DEFAULT_PULL_OVERLAP_MS } = options;
  const initialSyncMeta = syncMetaStore.load();

  const statusStore = createStore<SyncStatus>()(() => ({
    state: 'idle',
    lastSyncAt: null,
    errorMessage: null,
    saveCode: initialSyncMeta.saveCode,
    hasAcknowledgedSaveCode: initialSyncMeta.hasAcknowledgedSaveCode,
    clearedAt: null,
  }));

  const saveSyncMeta = (syncMeta: SyncMeta) => {
    syncMetaStore.save(syncMeta);
    statusStore.setState({ saveCode: syncMeta.saveCode, hasAcknowledgedSaveCode: syncMeta.hasAcknowledgedSaveCode });
  };

  async function runSyncRound() {
    statusStore.setState({ state: 'syncing', errorMessage: null });
    try {
      const syncMeta = syncMetaStore.load();
      const vaultKey = await hashSaveCodeToVaultKey(syncMeta.saveCode);

      if (syncMeta.hasPendingClear) {
        syncMeta.lastServerTime = await api.clear(vaultKey);
        Object.assign(syncMeta, FORGET_PUSHED_DATA, { hasPendingClear: false });
        saveSyncMeta(syncMeta);
      }

      // 往回多拉一小段:服务器事务提交有先后,可能漏掉时间戳略早于 lastServerTime 的行;合并是幂等的
      const changedSince = syncMeta.lastServerTime
        ? new Date(Date.parse(syncMeta.lastServerTime) - pullOverlapMs).toISOString()
        : null;
      const remoteSnapshot = await api.pull(vaultKey, changedSince);

      // 只有"同步过的设备"才会被别处的清空清掉;新设备带着本地数据来恢复存档码时不能被清
      const wasClearedElsewhere =
        !!remoteSnapshot.clearedAt &&
        !!syncMeta.lastServerTime &&
        Date.parse(remoteSnapshot.clearedAt) > Date.parse(syncMeta.lastServerTime);
      statusStore.setState({ clearedAt: remoteSnapshot.clearedAt });
      store.getState().applyRemoteSnapshot(remoteSnapshot, wasClearedElsewhere);
      if (wasClearedElsewhere) Object.assign(syncMeta, FORGET_PUSHED_DATA);

      const appState = store.getState();
      const pushedCheckInIds = new Set(syncMeta.pushedCheckInIds);
      for (const remoteCheckIn of remoteSnapshot.checkIns) {
        if (!remoteCheckIn.deleted) pushedCheckInIds.add(remoteCheckIn.id);
      }
      const unpushedCheckIns = appState.checkIns.filter((checkIn) => !pushedCheckInIds.has(checkIn.id));
      const progressToPush = appState.progress.map((entry) => ({ characterId: entry.characterId, graduated: entry.graduated }));
      const progressSignature = JSON.stringify(progressToPush);
      const profileUpdatedAt = appState.profileUpdatedAt ?? 0;
      const shouldPushProfile = !!appState.profile && profileUpdatedAt !== syncMeta.pushedProfileUpdatedAt;
      const shouldPushProgress = progressToPush.length > 0 && progressSignature !== syncMeta.pushedProgressSignature;

      if (unpushedCheckIns.length || shouldPushProfile || shouldPushProgress) {
        for (let batchStart = 0; batchStart === 0 || batchStart < unpushedCheckIns.length; batchStart += MAX_CHECK_INS_PER_PUSH) {
          const isFirstBatch = batchStart === 0;
          const payload: PushPayload = {
            checkIns: unpushedCheckIns.slice(batchStart, batchStart + MAX_CHECK_INS_PER_PUSH).map(toRemoteCheckIn),
            progress: isFirstBatch && shouldPushProgress ? progressToPush : [],
          };
          if (isFirstBatch && shouldPushProfile && appState.profile) {
            payload.profile = {
              nickname: appState.profile.nickname,
              avatarId: appState.profile.avatarId,
              anonymous: appState.profile.anonymous,
              activeCharacterId: appState.activeCharacterId,
              updatedAt: profileUpdatedAt,
            };
          }
          await api.push(vaultKey, payload);
        }
        for (const checkIn of unpushedCheckIns) pushedCheckInIds.add(checkIn.id);
        if (shouldPushProfile) syncMeta.pushedProfileUpdatedAt = profileUpdatedAt;
        if (shouldPushProgress) syncMeta.pushedProgressSignature = progressSignature;
      }

      syncMeta.pushedCheckInIds = [...pushedCheckInIds];
      syncMeta.lastServerTime = remoteSnapshot.serverTime;
      saveSyncMeta(syncMeta);
      statusStore.setState({ state: 'idle', lastSyncAt: now(), errorMessage: null });
    } catch (error) {
      statusStore.setState(
        error instanceof NetworkUnavailableError
          ? { state: 'offline' }
          : { state: 'error', errorMessage: error instanceof Error ? error.message : String(error) },
      );
    }
  }

  let currentRound: Promise<void> | null = null;
  let needsAnotherRound = false;

  function syncNow(): Promise<void> {
    if (currentRound) {
      needsAnotherRound = true;
      return currentRound;
    }
    currentRound = (async () => {
      do {
        needsAnotherRound = false;
        await runSyncRound();
      } while (needsAnotherRound);
    })().finally(() => { currentRound = null; });
    return currentRound;
  }

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const scheduleSync = () => {
    if (currentRound) { needsAnotherRound = true; return; } // 同步过程中又有变动,这一轮结束后再来一轮
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void syncNow(), SYNC_DEBOUNCE_MS);
  };

  return {
    statusStore,
    syncNow,

    /** 开始后台同步:本地有变动、恢复联网、回到页面、每分钟轮询(拿到别的设备的数据) */
    start() {
      const unsubscribeFromStore = store.subscribe(scheduleSync);
      const handleOnline = () => void syncNow();
      const handleVisibilityChange = () => { if (document.visibilityState === 'visible') void syncNow(); };
      window.addEventListener('online', handleOnline);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      const periodicSyncTimer = setInterval(handleVisibilityChange, PERIODIC_SYNC_INTERVAL_MS);
      void syncNow();
      return () => {
        unsubscribeFromStore();
        clearInterval(periodicSyncTimer);
        clearTimeout(debounceTimer);
        window.removeEventListener('online', handleOnline);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    },

    /** 换设备:输入存档码恢复。本机已有的记录会和云端合并,不会丢 */
    async restoreFromSaveCode(userInput: string): Promise<OperationResult> {
      const saveCode = normalizeSaveCode(userInput);
      if (!saveCode) return { ok: false, error: '存档码格式不对,应该是 16 位字母数字,例如 K7MQ-X2PD-9WTR-4HJF' };
      saveSyncMeta({ ...createInitialSyncMeta(saveCode), hasAcknowledgedSaveCode: true });
      await syncNow();
      const { state, errorMessage } = statusStore.getState();
      if (state === 'idle') return { ok: true };
      return { ok: false, error: state === 'offline' ? NETWORK_ERROR_MESSAGE : (errorMessage ?? '恢复失败') };
    },

    /** 清空全部数据:本地立刻清掉;云端软删除(离线时记下来,联网后先通知服务器) */
    clearAllData() {
      saveSyncMeta({ ...syncMetaStore.load(), ...FORGET_PUSHED_DATA, hasPendingClear: true });
      store.getState().resetAllData();
      void syncNow();
    },

    /** 直接问服务器:这个存档码对应的云端数据有多少。不合并、不改任何东西,只用来验证存档码和云端是否真的有数据 */
    async verifyCloud(): Promise<CloudVerification> {
      try {
        const vaultKey = await hashSaveCodeToVaultKey(syncMetaStore.load().saveCode);
        const remoteSnapshot = await api.pull(vaultKey, null);
        return {
          ok: true,
          checkInCount: remoteSnapshot.checkIns.length,
          characterCount: remoteSnapshot.progress.length,
          nickname: remoteSnapshot.profile?.nickname || null,
        };
      } catch (error) {
        return { ok: false, error: error instanceof NetworkUnavailableError ? NETWORK_ERROR_MESSAGE : '检查失败,请稍后再试' };
      }
    },

    /** 撤销清空(30 天内):云端把那次清空删掉的数据恢复,再整体拉回来,和现在的数据合并 */
    async undoClearAllData(): Promise<OperationResult> {
      try {
        const syncMeta = syncMetaStore.load();
        await api.restore(await hashSaveCodeToVaultKey(syncMeta.saveCode));
        // 全量重拉:被恢复的行时间戳是现在,但别的设备清空时已推进过 lastServerTime
        saveSyncMeta({ ...syncMeta, ...FORGET_PUSHED_DATA, lastServerTime: null });
        statusStore.setState({ clearedAt: null });
      } catch (error) {
        if (error instanceof NetworkUnavailableError) return { ok: false, error: NETWORK_ERROR_MESSAGE };
        const message = error instanceof Error ? error.message : '';
        if (message.includes('expired')) return { ok: false, error: '已经超过 30 天,数据已被永久清除' };
        if (message.includes('nothing to restore')) return { ok: false, error: '没有可以恢复的数据' };
        return { ok: false, error: '恢复失败,请稍后再试' };
      }
      await syncNow();
      return { ok: true };
    },

    acknowledgeSaveCode() {
      const syncMeta = syncMetaStore.load();
      if (!syncMeta.hasAcknowledgedSaveCode) saveSyncMeta({ ...syncMeta, hasAcknowledgedSaveCode: true });
    },
  };
}
