import type { AppState } from '../types/diary';

/** 全新用户、或清空全部数据之后的存档 */
export const EMPTY_APP_STATE: AppState = {
  version: 1,
  profile: null,
  activeCharacterId: null,
  checkIns: [],
  progress: [],
};
