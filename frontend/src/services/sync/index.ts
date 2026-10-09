import { appStore } from '../../stores/appStore';
import { createSyncApiFromEnvironment } from '../api/supabaseSyncApi';
import { createSyncEngine } from './syncEngine';
import { localStorageSyncMetaStore } from './syncMeta';

const syncApi = createSyncApiFromEnvironment();

/** 没配置 Supabase(没有 .env.local)时为 null,整个同步功能和相关界面都不出现 */
export const syncEngine = syncApi
  ? createSyncEngine({ store: appStore, api: syncApi, syncMetaStore: localStorageSyncMetaStore })
  : null;
