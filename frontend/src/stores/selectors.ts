import type { CheckIn } from '../types/diary';
import type { AppState } from '../services/storage/AppStateRepository';

/** 日历用:date -> 当天所有记录(按时间排序) */
export function groupByDate(checkIns: readonly CheckIn[]): Map<string, CheckIn[]> {
  const map = new Map<string, CheckIn[]>();
  for (const c of [...checkIns].sort((a, b) => a.at.localeCompare(b.at))) {
    map.set(c.date, [...(map.get(c.date) ?? []), c]);
  }
  return map;
}

export const activeProgress = (s: AppState) =>
  s.progress.find((p) => p.characterId === s.activeCharacterId) ?? null;

/** 图鉴:已毕业的角色 */
export const collected = (s: AppState) => s.progress.filter((p) => p.graduated);

/** 当前连续天数(截至 today;今天还没打卡则从昨天算起) */
export function currentStreak(checkIns: readonly CheckIn[], today: string): number {
  const days = new Set(checkIns.filter((c) => c.counted).map((c) => c.date));
  const latest = days.has(today) ? today : null;
  const last = latest ?? [...days].sort().pop();
  if (!last) return 0;
  const c = checkIns.find((x) => x.counted && x.date === last);
  const isRecent = last === today || addDay(last) === today;
  return isRecent && c ? c.streak : 0;
}

function addDay(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day + 1)).toISOString().slice(0, 10);
}
