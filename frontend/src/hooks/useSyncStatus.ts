import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { syncEngine } from '../services/sync';
import type { SyncStatus } from '../services/sync/syncEngine';

// hooks 不能条件调用,所以没配置后端时订阅这个永远是 null 的占位 store
const unavailableStatusStore = createStore<SyncStatus | null>()(() => null);

/** 同步状态;没配置后端时返回 null */
export function useSyncStatus(): SyncStatus | null {
  return useStore((syncEngine?.statusStore ?? unavailableStatusStore) as typeof unavailableStatusStore);
}
