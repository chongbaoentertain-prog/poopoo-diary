import type { AppState } from '../../types/diary';
import { EMPTY_APP_STATE } from '../../domain/emptyAppState';
import type { AppStateRepository } from './AppStateRepository';

const STORAGE_KEY = 'poopoo-diary:v1';

function isSavedAppState(value: unknown): value is AppState {
  const candidate = value as AppState;
  return (
    !!candidate &&
    candidate.version === 1 &&
    Array.isArray(candidate.checkIns) &&
    Array.isArray(candidate.progress) &&
    'profile' in candidate &&
    'activeCharacterId' in candidate
  );
}

export const localStorageRepository: AppStateRepository = {
  load() {
    try {
      const rawText = localStorage.getItem(STORAGE_KEY);
      if (!rawText) return { ...EMPTY_APP_STATE };
      const parsed: unknown = JSON.parse(rawText);
      return isSavedAppState(parsed) ? parsed : { ...EMPTY_APP_STATE };
    } catch {
      return { ...EMPTY_APP_STATE }; // 数据损坏或被禁用时降级为空状态
    }
  },
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 配额满/隐私模式:忽略,内存状态仍可用 */
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};
