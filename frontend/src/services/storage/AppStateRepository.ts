import type { CharacterProgress, CheckIn, Profile } from '../../types/diary';

export interface AppState {
  version: 1;
  profile: Profile | null; // null = 还没完成 onboarding
  activeCharacterId: string | null;
  checkIns: CheckIn[];
  progress: CharacterProgress[]; // 含已毕业(图鉴)的角色
  profileUpdatedAt?: number; // 资料(昵称/头像/当前角色)最后修改的毫秒时间戳,多设备同步时后写者胜
}

export const EMPTY_STATE: AppState = {
  version: 1,
  profile: null,
  activeCharacterId: null,
  checkIns: [],
  progress: [],
};

// 以后接后端/云同步,只需要再实现这个接口
export interface Repository {
  load(): AppState;
  save(state: AppState): void;
  clear(): void;
}
