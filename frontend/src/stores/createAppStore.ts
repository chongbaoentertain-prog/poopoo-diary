import { createStore } from 'zustand/vanilla';
import { CHARACTERS } from '../data/characters';
import { DEFAULT_MOOD } from '../data/moods';
import { toDateKey } from '../domain/date';
import { createInitialProgress, graduate } from '../domain/evolution';
import { mergeRemoteSnapshot } from '../domain/mergeRemoteSnapshot';
import { normalizeAppState } from '../domain/normalizeAppState';
import { recomputeFromCheckIns } from '../domain/recomputeFromCheckIns';
import { recordCheckIn, type CheckInResult } from '../domain/recordCheckIn';
import { formatStampId } from '../domain/stamp';
import type { AppStateRepository } from '../services/storage/AppStateRepository';
import type { Mood } from '../types/character';
import type { AppState, CharacterId, CharacterProgress, DateKey, Profile } from '../types/diary';
import type { RemoteSnapshot } from '../types/sync';

export interface BulkCheckInResult {
  addedDayCount: number;
  xpGained: number;
  evolved: boolean;
  reachedMax: boolean;
}

export interface AppActions {
  completeOnboarding(profile: Profile, characterId: CharacterId): void;
  updateProfile(profileChanges: Partial<Profile>): void;
  /** 打卡。date 默认今天,mood 为用户选的心情;返回结果供 UI 播放印章/进化动画 */
  checkIn(date?: DateKey, mood?: Mood): CheckInResult;
  /** 当前角色已满级时:毕业入图鉴并选择新角色(只能选图鉴里还没有的) */
  graduateAndChooseCharacter(newCharacterId: CharacterId): void;
  /** 批量打卡:跳过已打卡的日子,按日期顺序处理,最后统一重算 */
  checkInOnDates(dates: DateKey[]): BulkCheckInResult;
  /** 并入云端数据(同步层调用) */
  applyRemoteSnapshot(remote: RemoteSnapshot, shouldWipeLocal: boolean): void;
  resetAllData(): void;
}

export type AppStore = AppState & AppActions;

const generateId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** 印章用打卡"前"的形态:这一次签到让它进化了,印章上仍是进化前的样子 */
const buildStampId = (progress: CharacterProgress, mood: Mood = DEFAULT_MOOD) =>
  formatStampId({ characterId: progress.characterId, stage: progress.stage, mood });

export function createAppStore(repository: AppStateRepository) {
  const saveToRepository = (state: AppState) =>
    repository.save({
      version: 1,
      profile: state.profile,
      activeCharacterId: state.activeCharacterId,
      checkIns: state.checkIns,
      progress: state.progress,
      profileUpdatedAt: state.profileUpdatedAt,
    });

  return createStore<AppStore>()((set, get) => ({
    ...normalizeAppState(repository.load()),

    completeOnboarding(profile, characterId) {
      if (!CHARACTERS.some((character) => character.id === characterId)) throw new Error('未知角色');
      set({
        profile,
        activeCharacterId: characterId,
        progress: [createInitialProgress(characterId)],
        profileUpdatedAt: Date.now(),
      });
      saveToRepository(get());
    },

    updateProfile(profileChanges) {
      const { profile } = get();
      if (!profile) throw new Error('请先完成初始设置');
      set({ profile: { ...profile, ...profileChanges }, profileUpdatedAt: Date.now() });
      saveToRepository(get());
    },

    checkIn(date = toDateKey(new Date()), mood) {
      const { activeCharacterId, progress, checkIns } = get();
      const activeProgress = progress.find((entry) => entry.characterId === activeCharacterId);
      if (!activeProgress) throw new Error('请先选择角色');

      const result = recordCheckIn({
        existingCheckIns: checkIns,
        progress: activeProgress,
        date,
        recordedAt: new Date(),
        stampId: buildStampId(activeProgress, mood),
        checkInId: generateId(),
      });

      const recomputed = recomputeFromCheckIns([...checkIns, result.checkIn], progress);
      const progressAfter = recomputed.progress.find((entry) => entry.characterId === activeProgress.characterId)!;
      set({ checkIns: recomputed.checkIns, progress: recomputed.progress });
      saveToRepository(get());
      return {
        ...result,
        checkIn: recomputed.checkIns.find((checkIn) => checkIn.id === result.checkIn.id)!,
        progress: progressAfter,
        evolved: progressAfter.stage > activeProgress.stage,
        reachedMax: progressAfter.maxed && !activeProgress.maxed,
      };
    },

    graduateAndChooseCharacter(newCharacterId) {
      const { activeCharacterId, progress } = get();
      const activeProgress = progress.find((entry) => entry.characterId === activeCharacterId);
      if (!activeProgress) throw new Error('请先选择角色');
      if (!CHARACTERS.some((character) => character.id === newCharacterId)) throw new Error('未知角色');
      if (progress.some((entry) => entry.characterId === newCharacterId)) throw new Error('该角色已在图鉴中');

      const graduatedProgress = graduate(activeProgress); // 未满级会抛错
      set({
        progress: [
          ...progress.map((entry) => (entry.characterId === activeProgress.characterId ? graduatedProgress : entry)),
          createInitialProgress(newCharacterId),
        ],
        activeCharacterId: newCharacterId,
        profileUpdatedAt: Date.now(), // 当前培育的角色属于资料的一部分
      });
      saveToRepository(get());
    },

    checkInOnDates(dates) {
      const { activeCharacterId, progress, checkIns } = get();
      const activeProgress = progress.find((entry) => entry.characterId === activeCharacterId);
      if (!activeProgress) throw new Error('请先选择角色');

      const today = toDateKey(new Date());
      const datesAlreadyCounted = new Set(checkIns.filter((checkIn) => checkIn.counted).map((checkIn) => checkIn.date));
      const datesToCheckIn = [...new Set(dates)].filter((date) => date <= today && !datesAlreadyCounted.has(date)).sort();

      let allCheckIns = [...checkIns];
      let progressSoFar = activeProgress;
      for (const date of datesToCheckIn) {
        const result = recordCheckIn({
          existingCheckIns: allCheckIns,
          progress: progressSoFar,
          date,
          recordedAt: new Date(),
          stampId: buildStampId(progressSoFar),
          checkInId: generateId(),
        });
        allCheckIns = [...allCheckIns, result.checkIn];
        progressSoFar = result.progress;
      }

      const recomputed = recomputeFromCheckIns(allCheckIns, progress);
      const progressAfter = recomputed.progress.find((entry) => entry.characterId === activeProgress.characterId)!;
      set({ checkIns: recomputed.checkIns, progress: recomputed.progress });
      saveToRepository(get());
      return {
        addedDayCount: datesToCheckIn.length,
        xpGained: progressAfter.xp - activeProgress.xp,
        evolved: progressAfter.stage > activeProgress.stage,
        reachedMax: progressAfter.maxed && !activeProgress.maxed,
      };
    },

    applyRemoteSnapshot(remote, shouldWipeLocal) {
      const currentState = get();
      const mergedState = mergeRemoteSnapshot(currentState, remote, shouldWipeLocal);
      // 没有实际变化就不 set:否则每轮同步都会触发订阅者,进而再触发一轮同步
      const comparableContent = (state: AppState) =>
        JSON.stringify([state.profile, state.activeCharacterId, state.profileUpdatedAt, state.checkIns, state.progress]);
      if (comparableContent(mergedState) === comparableContent(currentState)) return;
      set(mergedState);
      saveToRepository(get());
    },

    resetAllData() {
      repository.clear();
      set({ ...repository.load(), profileUpdatedAt: undefined });
    },
  }));
}
