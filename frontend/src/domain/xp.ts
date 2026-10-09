import { BASE_XP, STREAK_BONUS_CAP, STREAK_BONUS_PER_DAY } from './rules';

/** 连续 1 天 = 1x;每多 1 天 +0.1,封顶 2x */
export function multiplierForStreak(streak: number): number {
  const bonus = Math.min(STREAK_BONUS_CAP, STREAK_BONUS_PER_DAY * Math.max(0, streak - 1));
  return Math.round((1 + bonus) * 100) / 100;
}

export function xpForStreak(streak: number): number {
  return Math.round(BASE_XP * multiplierForStreak(streak));
}
