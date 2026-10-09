import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { appStore } from '../store/useAppStore';
import { backendFromEnv } from './backend';
import { createSyncEngine, type SyncStatus } from './engine';
import { localStorageMeta } from './meta';

const backend = backendFromEnv();

/** 没配置 Supabase(没有 .env.local)时为 null,整个同步功能和相关界面都不出现 */
export const syncEngine = backend ? createSyncEngine({ store: appStore, backend, metaStore: localStorageMeta }) : null;

const unavailable = createStore<SyncStatus | null>()(() => null);

/** 同步状态;没配置后端时返回 null(hooks 不能条件调用,所以没有引擎时订阅一个永远是 null 的 store) */
export function useSyncStatus(): SyncStatus | null {
  return useStore((syncEngine?.status ?? unavailable) as typeof unavailable);
}
