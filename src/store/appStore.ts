import { createStore } from 'zustand/vanilla';
import { recordCheckIn, type CheckInResult } from '../domain/checkin';
import { recomputeAll } from '../domain/recompute';
import { applyRemote } from '../sync/merge';
import type { RemoteSnapshot } from '../sync/types';
import { normalizeState } from './normalize';
import { toDateKey } from '../domain/date';
import { graduate, newProgress } from '../domain/evolution';
import type { CharacterProgress, Profile } from '../domain/types';
import { CHARACTERS, type Mood } from '../data/characters';
import { EMPTY_STATE, type AppState, type Repository } from '../storage/repository';

export interface AppActions {
  completeOnboarding(profile: Profile, characterId: string): void;
  updateProfile(patch: Partial<Profile>): void;
  /** 打卡。date 默认今天,mood 为用户选的心情(默认开心);返回结果供 UI 播放印章/进化动画 */
  checkIn(date?: string, mood?: Mood): CheckInResult;
  /** 当前角色已满级时:毕业入图鉴并选择新角色(只能选图鉴里还没有的) */
  graduateAndPick(newCharacterId: string): void;
  /** 批量打卡:跳过已打卡的日子,按日期顺序处理,最后统一重算 */
  checkInMany(dates: string[]): BatchResult;
  /** 并入云端数据(同步层调用) */
  mergeRemote(remote: RemoteSnapshot, wipe: boolean): void;
  resetAll(): void;
}

export interface BatchResult { added: number; xpGained: number; evolved: boolean; reachedMax: boolean }
export type AppStore = AppState & AppActions;

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// stamp 样式跟随角色 + 形态,对应 components/art 里的 SVG
export const stampIdFor = (p: CharacterProgress, mood: Mood = 'happy') => `${p.characterId}:${p.stage}:${mood}`;

export function createAppStore(repo: Repository) {
  const persist = (s: AppState) =>
    repo.save({
      version: 1,
      profile: s.profile,
      activeCharacterId: s.activeCharacterId,
      checkIns: s.checkIns,
      progress: s.progress,
      profileUpdatedAt: s.profileUpdatedAt,
    });

  return createStore<AppStore>()((set, get) => ({
    ...normalizeState(repo.load()),

    completeOnboarding(profile, characterId) {
      if (!CHARACTERS.some((c) => c.id === characterId)) throw new Error('未知角色');
      set({
        profile,
        activeCharacterId: characterId,
        progress: [newProgress(characterId)],
        profileUpdatedAt: Date.now(),
      });
      persist(get());
    },

    updateProfile(patch) {
      const { profile } = get();
      if (!profile) throw new Error('请先完成初始设置');
      set({ profile: { ...profile, ...patch }, profileUpdatedAt: Date.now() });
      persist(get());
    },

    checkIn(date = toDateKey(new Date()), mood) {
      const { activeCharacterId, progress, checkIns } = get();
      const current = progress.find((p) => p.characterId === activeCharacterId);
      if (!current) throw new Error('请先选择角色');

      const result = recordCheckIn({
        existing: checkIns,
        progress: current,
        date,
        now: new Date(),
        stampId: stampIdFor(current, mood), // 用打卡"前"的形态盖章
        id: newId(),
      });

      const rebuilt = recomputeAll([...checkIns, result.checkIn], progress);
      const after = rebuilt.progress.find((p) => p.characterId === current.characterId)!;
      set({ checkIns: rebuilt.checkIns, progress: rebuilt.progress });
      persist(get());
      return {
        ...result,
        checkIn: rebuilt.checkIns.find((c) => c.id === result.checkIn.id)!,
        progress: after,
        evolved: after.stage > current.stage,
        reachedMax: after.maxed && !current.maxed,
      };
    },

    graduateAndPick(newCharacterId) {
      const { activeCharacterId, progress } = get();
      const current = progress.find((p) => p.characterId === activeCharacterId);
      if (!current) throw new Error('请先选择角色');
      if (!CHARACTERS.some((c) => c.id === newCharacterId)) throw new Error('未知角色');
      if (progress.some((p) => p.characterId === newCharacterId)) {
        throw new Error('该角色已在图鉴中');
      }
      const graduated = graduate(current); // 未满级会抛错
      set({
        progress: [
          ...progress.map((p) => (p.characterId === current.characterId ? graduated : p)),
          newProgress(newCharacterId),
        ],
        activeCharacterId: newCharacterId,
        profileUpdatedAt: Date.now(), // 当前培育的角色属于资料的一部分
      });
      persist(get());
    },

    checkInMany(dates) {
      const { activeCharacterId, progress, checkIns } = get();
      const current = progress.find((p) => p.characterId === activeCharacterId);
      if (!current) throw new Error('请先选择角色');
      const today = toDateKey(new Date());
      const have = new Set(checkIns.filter((c) => c.counted).map((c) => c.date));
      const todo = [...new Set(dates)].filter((d) => d <= today && !have.has(d)).sort();
      let all = [...checkIns];
      let cur = current;
      for (const date of todo) {
        const r = recordCheckIn({ existing: all, progress: cur, date, now: new Date(), stampId: stampIdFor(cur), id: newId() });
        all = [...all, r.checkIn];
        cur = r.progress;
      }
      const rebuilt = recomputeAll(all, progress);
      const after = rebuilt.progress.find((p) => p.characterId === current.characterId)!;
      set({ checkIns: rebuilt.checkIns, progress: rebuilt.progress });
      persist(get());
      return { added: todo.length, xpGained: after.xp - current.xp, evolved: after.stage > current.stage, reachedMax: after.maxed && !current.maxed };
    },

    mergeRemote(remote, wipe) {
      const cur = get();
      const next = applyRemote(cur, remote, wipe);
      // 没有实际变化就不 set:否则每轮同步都会触发订阅者,进而再触发一轮同步
      const view = (x: AppState) => JSON.stringify([x.profile, x.activeCharacterId, x.profileUpdatedAt, x.checkIns, x.progress]);
      if (view(next) === view(cur)) return;
      set(next);
      persist(get());
    },

    resetAll() {
      repo.clear();
      set({ ...repo.load(), profileUpdatedAt: undefined });
    },
  }));
}
