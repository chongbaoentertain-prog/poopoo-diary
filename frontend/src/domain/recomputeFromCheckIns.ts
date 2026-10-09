import type { CharacterProgress, CheckIn } from '../types/diary';
import { compareByDate } from './compareCheckIns';
import { addDays } from './date';
import { stageForXp } from './evolution';
import { MAX_STAGE } from './rules';
import { multiplierForStreak, xpForStreak } from './xp';

interface DerivedCheckInValues {
  streak: number;
  multiplier: number;
  xpGained: number;
}

/**
 * 按"全部打卡记录"重算连续天数 / 倍率 / 经验 / 形态。
 * 补卡、乱序补卡、跨月都靠它保证结果与打卡顺序无关。
 */
export function recomputeFromCheckIns(checkIns: readonly CheckIn[], progressList: readonly CharacterProgress[]) {
  const countedCheckIns = checkIns.filter((checkIn) => checkIn.counted).sort(compareByDate);

  const derivedValuesByCheckInId = new Map<string, DerivedCheckInValues>();
  let previousDate = '';
  let streak = 0;
  for (const checkIn of countedCheckIns) {
    if (checkIn.date !== previousDate) {
      const continuesPreviousDay = previousDate !== '' && addDays(checkIn.date, -1) === previousDate;
      streak = continuesPreviousDay ? streak + 1 : 1;
    }
    previousDate = checkIn.date;
    derivedValuesByCheckInId.set(checkIn.id, { streak, multiplier: multiplierForStreak(streak), xpGained: xpForStreak(streak) });
  }

  const recomputedCheckIns = checkIns.map((checkIn) => {
    const derived = derivedValuesByCheckInId.get(checkIn.id);
    return derived ? { ...checkIn, ...derived } : checkIn;
  });

  const totalXpByCharacterId = new Map<string, number>();
  for (const checkIn of recomputedCheckIns) {
    if (!checkIn.counted) continue;
    totalXpByCharacterId.set(checkIn.characterId, (totalXpByCharacterId.get(checkIn.characterId) ?? 0) + checkIn.xpGained);
  }

  const recomputedProgress = progressList.map((progress) => {
    const xp = totalXpByCharacterId.get(progress.characterId) ?? 0;
    const stage = stageForXp(xp);
    return { ...progress, xp, stage, maxed: stage >= MAX_STAGE };
  });

  return { checkIns: recomputedCheckIns, progress: recomputedProgress };
}
