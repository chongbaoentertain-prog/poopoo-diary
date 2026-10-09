import { useStore } from 'zustand';
import { localStorageRepo } from '../storage/localStorageRepo';
import { createAppStore, type AppStore } from './appStore';

export const appStore = createAppStore(localStorageRepo);

export function useAppStore<T>(selector: (s: AppStore) => T): T {
  return useStore(appStore, selector);
}
