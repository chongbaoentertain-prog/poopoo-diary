import { useStore } from 'zustand';
import { localStorageRepo } from '../services/storage/localStorageRepository';
import { createAppStore, type AppStore } from '../stores/createAppStore';

export const appStore = createAppStore(localStorageRepo);

export function useAppStore<T>(selector: (s: AppStore) => T): T {
  return useStore(appStore, selector);
}
