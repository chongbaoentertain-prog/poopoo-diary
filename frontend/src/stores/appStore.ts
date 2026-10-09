import { localStorageRepository } from '../services/storage/localStorageRepository';
import { createAppStore } from './createAppStore';

/** 整个应用共用的那一个 store,存档放在 localStorage。组件里请用 hooks/useAppStore */
export const appStore = createAppStore(localStorageRepository);
