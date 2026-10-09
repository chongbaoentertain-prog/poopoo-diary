import type { DateKey } from '../types/diary';

// 日期统一用 'YYYY-MM-DD' 字符串,避免时区/夏令时问题
export function toDateKey(date: Date): DateKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: DateKey, dayCount: number): DateKey {
  const [year, month, day] = dateKey.split('-').map(Number);
  const shiftedDate = new Date(Date.UTC(year, month - 1, day + dayCount));
  return shiftedDate.toISOString().slice(0, 10);
}
