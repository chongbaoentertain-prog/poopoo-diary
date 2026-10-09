import { createStore } from 'zustand/vanilla';
import type { CheckIn } from '../../types/diary';
import type { createAppStore } from '../../stores/createAppStore';
import { OfflineError } from '../api/supabaseSyncApi';
import { codeToKey, normalizeCode } from './saveCode';
import { freshMeta, type MetaStore, type SyncMeta } from './syncMeta';
import type { PushPayload, RemoteCheckIn, SyncBackend } from './syncTypes';

type AppStoreApi = ReturnType<typeof createAppStore>;

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';
export interface SyncStatus {
  state: SyncState;
  lastSyncAt: number | null;
  error: string | null;
  code: string;
  codeAcknowledged: boolean;
  clearedAt: string | null; // 云端最近一次清空的时间;30 天内可以恢复
}

const CHUNK = 500; // 服务器单次最多收 1000 条,留一半余量
const toRemote = (c: CheckIn): RemoteCheckIn => ({ id: c.id, date: c.date, at: c.at, characterId: c.characterId, stampId: c.stampId, counted: c.counted });
const reset = { pushedIds: [], pushedProfileAt: null, pushedProgress: '' } satisfies Partial<SyncMeta>;

/**
 * 本地优先的同步引擎:页面永远读写本地存档,这里在后台把变动和云端对齐。
 * 每一轮:(先通知清空) → 拉取云端变动并合并 → 把本地新增的推上去。
 * 任何一步网络失败都只是"等下次",本地数据不受影响。
 */
export function createSyncEngine(opts: {
  store: AppStoreApi;
  backend: SyncBackend;
  metaStore: MetaStore;
  now?: () => number;
  overlapMs?: number;
}) {
  const { store, backend, metaStore, now = Date.now, overlapMs = 60_000 } = opts;
  const initial = metaStore.load();
  const status = createStore<SyncStatus>()(() => ({
    state: 'idle', lastSyncAt: null, error: null, code: initial.code, codeAcknowledged: initial.codeAcknowledged, clearedAt: null,
  }));

  const saveMeta = (m: SyncMeta) => {
    metaStore.save(m);
    status.setState({ code: m.code, codeAcknowledged: m.codeAcknowledged });
  };

  async function syncOnce() {
    status.setState({ state: 'syncing', error: null });
    try {
      const meta = metaStore.load();
      const key = await codeToKey(meta.code);

      if (meta.pendingClear) {
        meta.lastServerTime = await backend.clear(key);
        Object.assign(meta, reset, { pendingClear: false });
        saveMeta(meta);
      }

      // 往回多拉一小段:服务器事务提交有先后,可能漏掉时间戳略早于 lastServerTime 的行;合并是幂等的
      const since = meta.lastServerTime ? new Date(Date.parse(meta.lastServerTime) - overlapMs).toISOString() : null;
      const snap = await backend.pull(key, since);
      // 只有"同步过的设备"才会被别处的清空清掉;新设备带着本地数据来恢复存档码时不能被清
      const wipe = !!snap.clearedAt && !!meta.lastServerTime && Date.parse(snap.clearedAt) > Date.parse(meta.lastServerTime);
      status.setState({ clearedAt: snap.clearedAt });
      store.getState().mergeRemote(snap, wipe);
      if (wipe) Object.assign(meta, reset);

      const s = store.getState();
      const pushed = new Set(meta.pushedIds);
      for (const c of snap.checkIns) if (!c.deleted) pushed.add(c.id);
      const fresh = s.checkIns.filter((c) => !pushed.has(c.id));
      const progress = s.progress.map((p) => ({ characterId: p.characterId, graduated: p.graduated }));
      const progressSig = JSON.stringify(progress);
      const profileAt = s.profileUpdatedAt ?? 0;
      const sendProfile = !!s.profile && profileAt !== meta.pushedProfileAt;
      const sendProgress = progress.length > 0 && progressSig !== meta.pushedProgress;

      if (fresh.length || sendProfile || sendProgress) {
        for (let i = 0; i === 0 || i < fresh.length; i += CHUNK) {
          const payload: PushPayload = { checkIns: fresh.slice(i, i + CHUNK).map(toRemote), progress: i === 0 && sendProgress ? progress : [] };
          if (i === 0 && sendProfile && s.profile) {
            payload.profile = { nickname: s.profile.nickname, avatarId: s.profile.avatarId, anonymous: s.profile.anonymous, activeCharacterId: s.activeCharacterId, updatedAt: profileAt };
          }
          await backend.push(key, payload);
        }
        for (const c of fresh) pushed.add(c.id);
        if (sendProfile) meta.pushedProfileAt = profileAt;
        if (sendProgress) meta.pushedProgress = progressSig;
      }

      meta.pushedIds = [...pushed];
      meta.lastServerTime = snap.serverTime;
      saveMeta(meta);
      status.setState({ state: 'idle', lastSyncAt: now(), error: null });
    } catch (e) {
      status.setState(e instanceof OfflineError ? { state: 'offline' } : { state: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  }

  let running: Promise<void> | null = null;
  let again = false;
  function syncNow(): Promise<void> {
    if (running) { again = true; return running; }
    running = (async () => { do { again = false; await syncOnce(); } while (again); })().finally(() => { running = null; });
    return running;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if (running) { again = true; return; } // 同步过程中又有变动,这一轮结束后再来一轮
    clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), 1500);
  };

  return {
    status,
    syncNow,

    /** 开始后台同步:本地有变动、恢复联网、回到页面、每分钟轮询(拿到别的设备的数据) */
    start() {
      const unsub = store.subscribe(schedule);
      const onOnline = () => void syncNow();
      const onVisible = () => { if (document.visibilityState === 'visible') void syncNow(); };
      window.addEventListener('online', onOnline);
      document.addEventListener('visibilitychange', onVisible);
      const poll = setInterval(onVisible, 60_000);
      void syncNow();
      return () => {
        unsub(); clearInterval(poll); clearTimeout(timer);
        window.removeEventListener('online', onOnline); document.removeEventListener('visibilitychange', onVisible);
      };
    },

    /** 换设备:输入存档码恢复。本机已有的记录会和云端合并,不会丢 */
    async restore(input: string): Promise<{ ok: true } | { ok: false; error: string }> {
      const code = normalizeCode(input);
      if (!code) return { ok: false, error: '存档码格式不对,应该是 16 位字母数字,例如 K7MQ-X2PD-9WTR-4HJF' };
      saveMeta({ ...freshMeta(code), codeAcknowledged: true });
      await syncNow();
      const { state, error } = status.getState();
      return state === 'idle' ? { ok: true } : { ok: false, error: state === 'offline' ? '现在连不上服务器,请联网后再试' : (error ?? '恢复失败') };
    },

    /** 清空全部数据:本地立刻清掉;云端软删除(离线时记下来,联网后先通知服务器) */
    clearAll() {
      saveMeta({ ...metaStore.load(), ...reset, pendingClear: true });
      store.getState().resetAll();
      void syncNow();
    },

    /** 直接问服务器:这个存档码对应的云端数据有多少。不合并、不改任何东西,只用来验证存档码和云端是否真的有数据 */
    async verifyCloud(): Promise<{ ok: true; checkIns: number; characters: number; nickname: string | null } | { ok: false; error: string }> {
      try {
        const snap = await backend.pull(await codeToKey(metaStore.load().code), null);
        return { ok: true, checkIns: snap.checkIns.length, characters: snap.progress.length, nickname: snap.profile?.nickname || null };
      } catch (e) {
        return { ok: false, error: e instanceof OfflineError ? '现在连不上服务器,请联网后再试' : '检查失败,请稍后再试' };
      }
    },

    /** 撤销清空(30 天内):云端把那次清空删掉的数据恢复,再整体拉回来,和现在的数据合并 */
    async undoClear(): Promise<{ ok: true } | { ok: false; error: string }> {
      try {
        const meta = metaStore.load();
        await backend.restore(await codeToKey(meta.code));
        saveMeta({ ...meta, ...reset, lastServerTime: null }); // 全量重拉:被恢复的行时间戳是现在,但别的设备清空时已推进过 lastServerTime
        status.setState({ clearedAt: null });
      } catch (e) {
        if (e instanceof OfflineError) return { ok: false, error: '现在连不上服务器,请联网后再试' };
        const msg = e instanceof Error ? e.message : '';
        return { ok: false, error: msg.includes('expired') ? '已经超过 30 天,数据已被永久清除' : msg.includes('nothing to restore') ? '没有可以恢复的数据' : '恢复失败,请稍后再试' };
      }
      await syncNow();
      return { ok: true };
    },

    acknowledgeCode() {
      const meta = metaStore.load();
      if (!meta.codeAcknowledged) saveMeta({ ...meta, codeAcknowledged: true });
    },
  };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;
