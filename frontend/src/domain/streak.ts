import type { DateKey } from '../types/diary';
import { addDays } from './date';

/**
 * 若在 `date` 这天打卡,连续天数是多少?
 * = 1(今天)+ 往前连续有"计入打卡"的天数
 * countedDates: 所有已计入过打卡的日期集合
 */
export function streakOnDate(date: DateKey, countedDates: ReadonlySet<DateKey>): number {
  let streak = 1;
  let previousDate = addDays(date, -1);
  while (countedDates.has(previousDate)) {
    streak++;
    previousDate = addDays(previousDate, -1);
  }
  return streak;
}
