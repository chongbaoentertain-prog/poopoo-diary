import type { AppState } from '../../types/diary';
import { EMPTY_APP_STATE } from '../../domain/emptyAppState';
import type { AppStateRepository } from './AppStateRepository';

/** 测试用:存档只放在内存里 */
export function createMemoryRepository(initialState: AppState = EMPTY_APP_STATE): AppStateRepository {
  let savedState = initialState;
  return {
    load: () => savedState,
    save: (state) => {
      savedState = state;
    },
    clear: () => {
      savedState = EMPTY_APP_STATE;
    },
  };
}
