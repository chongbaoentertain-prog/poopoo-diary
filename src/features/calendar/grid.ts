import { addDays } from '../../domain/date';

const parse = (k: string) => { const [y, m, d] = k.split('-').map(Number); return { y, m, d }; };
const key = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const weekday = (k: string) => (new Date(`${k}T00:00:00Z`).getUTCDay() + 6) % 7; // 周一 = 0

export const weekDays = (k: string) => Array.from({ length: 7 }, (_, i) => addDays(addDays(k, -weekday(k)), i));
export const addMonths = (k: string, n: number) => { const { y, m } = parse(k); return key(y, m + n, 1); };
export const inMonth = (d: string, anchor: string) => d.slice(0, 7) === anchor.slice(0, 7);

export function monthGrid(anchor: string): string[][] {
  const { y, m } = parse(anchor);
  const last = key(y, m + 1, 0);
  const weeks: string[][] = [];
  for (let c = key(y, m, 1); c <= last; c = addDays(c, 7)) weeks.push(weekDays(c));
  return weeks;
}
