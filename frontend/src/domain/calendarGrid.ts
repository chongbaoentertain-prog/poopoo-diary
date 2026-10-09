import type { DateKey } from '../types/diary';
import { addDays } from './date';

const parseDateKey = (dateKey: DateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
};

const toUtcDateKey = (year: number, month: number, day: number): DateKey =>
  new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

/** 周一 = 0 ... 周日 = 6 */
const mondayBasedWeekday = (dateKey: DateKey) => (new Date(`${dateKey}T00:00:00Z`).getUTCDay() + 6) % 7;

/** 包含这一天的那一周(周一开头)的 7 个日期 */
export const getWeekDateKeys = (dateKey: DateKey): DateKey[] => {
  const monday = addDays(dateKey, -mondayBasedWeekday(dateKey));
  return Array.from({ length: 7 }, (_, dayOffset) => addDays(monday, dayOffset));
};

/** 移动到几个月后的 1 号 */
export const addMonthsToDateKey = (dateKey: DateKey, monthCount: number): DateKey => {
  const { year, month } = parseDateKey(dateKey);
  return toUtcDateKey(year, month + monthCount, 1);
};

export const isInSameMonth = (dateKey: DateKey, anchorDateKey: DateKey) => dateKey.slice(0, 7) === anchorDateKey.slice(0, 7);

/** 某月的日历格子:按周分行,每行 7 天(周一开头),首尾补齐上下月的日期 */
export function getMonthGrid(anchorDateKey: DateKey): DateKey[][] {
  const { year, month } = parseDateKey(anchorDateKey);
  const lastDayOfMonth = toUtcDateKey(year, month + 1, 0);
  const weeks: DateKey[][] = [];
  for (let weekStart = toUtcDateKey(year, month, 1); weekStart <= lastDayOfMonth; weekStart = addDays(weekStart, 7)) {
    weeks.push(getWeekDateKeys(weekStart));
  }
  return weeks;
}
