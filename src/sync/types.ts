/** 本地和服务器之间传输的数据形状。只含原始数据,经验/形态/连续天数一律由本地重算。 */

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

/** 服务器能力的抽象:真实实现走 Supabase RPC,测试用内存实现 */
export interface SyncBackend {
  pull(key: string, since: string | null): Promise<RemoteSnapshot>;
  push(key: string, payload: PushPayload): Promise<string>;
  clear(key: string): Promise<string>;
  /** 恢复最近一次清空(30 天内) */
  restore(key: string): Promise<string>;
}
