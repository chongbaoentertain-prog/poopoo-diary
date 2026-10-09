/**
 * 本地和服务器之间传输的数据形状。只含原始数据,经验/形态/连续天数一律由本地重算。
 * 对应后端 backend/supabase/migrations 里的三个函数:sync_pull / sync_push / vault_clear。
 */

export interface RemoteCheckIn {
  id: string;
  date: string;
  at: string;
  characterId: string;
  stampId: string;
  counted: boolean;
  deleted?: boolean; // 软删除:拉取时带回,客户端据此删掉本地
}

export interface RemoteProgress {
  characterId: string;
  graduated: boolean;
  deleted?: boolean;
}

export interface RemoteProfile {
  nickname: string;
  avatarId: string;
  anonymous?: boolean;
  activeCharacterId: string | null;
  updatedAt: number; // 客户端毫秒时间戳,后写者胜
}

export interface RemoteSnapshot {
  profile: RemoteProfile | null;
  checkIns: RemoteCheckIn[];
  progress: RemoteProgress[];
  clearedAt: string | null; // 最近一次「清空全部数据」
  serverTime: string;
}

export interface PushPayload {
  profile?: RemoteProfile;
  checkIns: RemoteCheckIn[];
  progress: RemoteProgress[];
}

/**
 * 前端调后端的唯一入口。真实实现走 Supabase RPC(services/api),测试用内存实现(tests/fakeSyncApi.ts)。
 * vaultKey 是存档码的 SHA-256,后端靠它区分是谁的数据。
 */
export interface SyncApi {
  /** changedSince 为 null 时返回全量(不含已删除);否则返回这个时间之后变动过的行(含已删除) */
  pull(vaultKey: string, changedSince: string | null): Promise<RemoteSnapshot>;
  /** 返回服务器时间 */
  push(vaultKey: string, payload: PushPayload): Promise<string>;
  /** 清空全部数据(软删除),返回服务器时间 */
  clear(vaultKey: string): Promise<string>;
  /** 恢复最近一次清空(30 天内),返回服务器时间 */
  restore(vaultKey: string): Promise<string>;
}
