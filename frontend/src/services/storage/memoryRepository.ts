import { EMPTY_STATE, type AppState, type Repository } from './AppStateRepository';

/** 测试用 */
export function createMemoryRepo(initial: AppState = EMPTY_STATE): Repository {
  let state = initial;
  return {
    load: () => state,
    save: (s) => {
      state = s;
    },
    clear: () => {
      state = EMPTY_STATE;
    },
  };
}
