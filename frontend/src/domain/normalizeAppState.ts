import { CHARACTERS } from '../data/characters';
import { EMPTY_APP_STATE } from './emptyAppState';
import type { AppState } from '../types/diary';
import { compareByTime } from './compareCheckIns';
import { recomputeFromCheckIns } from './recomputeFromCheckIns';

/**
 * 读档、合并云端数据之后统一做的修正,保证状态自洽:
 * 1. 丢掉已下架角色(beta 期间角色表缩减过);一只有效角色都不剩就回到初始状态,让用户重新选角。
 * 2. 当前角色 / 头像指向不存在的角色时,换成剩下的第一只。
 * 3. 同一天只能有一条"计经验"的记录(两台设备各自签到时会冲突),保留最早的。
 * 4. 重算连续天数、倍率、经验、形态。
 */
export function normalizeAppState(state: AppState): AppState {
  const knownCharacterIds = new Set(CHARACTERS.map((character) => character.id));
  const progress = state.progress.filter((entry) => knownCharacterIds.has(entry.characterId));
  if (state.profile && progress.length === 0) return EMPTY_APP_STATE;

  const activeProgress =
    progress.find((entry) => entry.characterId === state.activeCharacterId) ??
    progress.find((entry) => !entry.graduated) ??
    progress[0];
  const profile =
    state.profile && !knownCharacterIds.has(state.profile.avatarId) && activeProgress
      ? { ...state.profile, avatarId: activeProgress.characterId }
      : state.profile;

  const datesWithCountedCheckIn = new Set<string>();
  const checkIns = [...state.checkIns]
    .sort(compareByTime)
    .map((checkIn) => {
      if (!checkIn.counted) return checkIn;
      if (datesWithCountedCheckIn.has(checkIn.date)) return { ...checkIn, counted: false };
      datesWithCountedCheckIn.add(checkIn.date);
      return checkIn;
    });

  const recomputed = recomputeFromCheckIns(checkIns, progress);
  return {
    ...state,
    profile,
    activeCharacterId: activeProgress?.characterId ?? null,
    checkIns: recomputed.checkIns,
    progress: recomputed.progress,
  };
}
