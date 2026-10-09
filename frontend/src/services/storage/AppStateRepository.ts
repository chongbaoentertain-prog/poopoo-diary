import type { AppState } from '../../types/diary';

/** 本地存档的读写接口。浏览器里用 localStorageRepository,测试用 memoryRepository */
export interface AppStateRepository {
  load(): AppState;
  save(state: AppState): void;
  clear(): void;
}
