import { useStore } from 'zustand';
import { appStore } from '../stores/appStore';
import type { AppStore } from '../stores/createAppStore';

export function useAppStore<Selected>(selector: (store: AppStore) => Selected): Selected {
  return useStore(appStore, selector);
}
