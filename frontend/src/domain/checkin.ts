import { applyXp } from './evolution';
import { streakOnDate } from './streak';
import { multiplierForStreak, xpForStreak } from './xp';
import type { CharacterProgress, CheckIn } from './types';

export interface CheckInResult {
  checkIn: CheckIn;
  progress: CharacterProgress;
  evolved: boolean;
  reachedMax: boolean;
}

/**
 * 记录一次打卡(纯函数,不碰存储)。
 * 规则:一天可记录多次,但只有当天第一条计经验和连续天数。
 */
export function recordCheckIn(params: {
  existing: readonly CheckIn[];
  progress: CharacterProgress;
  date: string; // YYYY-MM-DD
  now: Date;
  stampId: string;
  id: string;
}): CheckInResult {
  const { existing, progress, date, now, stampId, id } = params;
  const countedDates = new Set(existing.filter((c) => c.counted).map((c) => c.date));
  const counted = !countedDates.has(date);
  const streak = streakOnDate(date, countedDates);

  const xpGained = counted ? xpForStreak(streak) : 0;
  const { progress: next, evolved, reachedMax } = applyXp(progress, xpGained);

  return {
    checkIn: {
      id,
      date,
      at: now.toISOString(),
      characterId: progress.characterId,
      stampId,
      counted,
      xpGained,
      streak,
      multiplier: counted ? multiplierForStreak(streak) : 1,
    },
    progress: next,
    evolved,
    reachedMax,
  };
}
