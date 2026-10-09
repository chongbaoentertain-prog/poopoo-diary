import { EMPTY_STATE, type AppState, type Repository } from './repository';

const KEY = 'poopoo-diary:v1';

function isValid(x: unknown): x is AppState {
  const s = x as AppState;
  return (
    !!s &&
    s.version === 1 &&
    Array.isArray(s.checkIns) &&
    Array.isArray(s.progress) &&
    'profile' in s &&
    'activeCharacterId' in s
  );
}

export const localStorageRepo: Repository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...EMPTY_STATE };
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : { ...EMPTY_STATE };
    } catch {
      return { ...EMPTY_STATE }; // 数据损坏或被禁用时降级为空状态
    }
  },
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* 配额满/隐私模式:忽略,内存状态仍可用 */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
