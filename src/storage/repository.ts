import type { CharacterProgress, CheckIn, Profile } from '../domain/types';

export interface AppState {
  version: 1;
  profile: Profile | null; // null = 还没完成 onboarding
  activeCharacterId: string | null;
  checkIns: CheckIn[];
  progress: CharacterProgress[]; // 含已毕业(图鉴)的角色
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
