import type { CharacterProgress, CheckIn, DateKey } from '../types/diary';
import { applyXp } from './evolution';
import { streakOnDate } from './streak';
import { multiplierForStreak, xpForStreak } from './xp';

export interface CheckInResult {
  checkIn: CheckIn;
  progress: CharacterProgress;
  evolved: boolean;
  reachedMax: boolean;
}

export interface RecordCheckInInput {
  existingCheckIns: readonly CheckIn[];
  progress: CharacterProgress;
  date: DateKey;
  recordedAt: Date;
  stampId: string;
  checkInId: string;
}

/**
 * 记录一次打卡(纯函数,不碰存储)。
 * 规则:一天可记录多次,但只有当天第一条计经验和连续天数。
 */
export function recordCheckIn(input: RecordCheckInInput): CheckInResult {
  const { existingCheckIns, progress, date, recordedAt, stampId, checkInId } = input;
  const countedDates = new Set(existingCheckIns.filter((checkIn) => checkIn.counted).map((checkIn) => checkIn.date));
  const counted = !countedDates.has(date);
  const streak = streakOnDate(date, countedDates);

  const xpGained = counted ? xpForStreak(streak) : 0;
  const { progress: updatedProgress, evolved, reachedMax } = applyXp(progress, xpGained);

  return {
    checkIn: {
      id: checkInId,
      date,
      at: recordedAt.toISOString(),
      characterId: progress.characterId,
      stampId,
      counted,
      xpGained,
      streak,
      multiplier: counted ? multiplierForStreak(streak) : 1,
    },
    progress: updatedProgress,
    evolved,
    reachedMax,
  };
}
