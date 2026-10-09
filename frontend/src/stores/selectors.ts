import type { Mood } from '../types/character';
import { compareByTime } from '../domain/compareCheckIns';
import { addDays } from '../domain/date';
import { parseStampId } from '../domain/stamp';
import type { AppState, CharacterId, CheckIn, DateKey } from '../types/diary';

/** 日历用:日期 -> 当天所有记录(按时间排序) */
export function groupCheckInsByDate(checkIns: readonly CheckIn[]): Map<DateKey, CheckIn[]> {
  const checkInsByDate = new Map<DateKey, CheckIn[]>();
  for (const checkIn of [...checkIns].sort(compareByTime)) {
    checkInsByDate.set(checkIn.date, [...(checkInsByDate.get(checkIn.date) ?? []), checkIn]);
  }
  return checkInsByDate;
}

export const selectActiveProgress = (state: AppState) =>
  state.progress.find((entry) => entry.characterId === state.activeCharacterId) ?? null;

/** 图鉴用:每只角色最近一次签到时选的心情 */
export function getLastMoodByCharacterId(checkIns: readonly CheckIn[]): Map<CharacterId, Mood> {
  const lastMoodByCharacterId = new Map<CharacterId, Mood>();
  for (const checkIn of [...checkIns].sort(compareByTime)) {
    lastMoodByCharacterId.set(checkIn.characterId, parseStampId(checkIn.stampId).mood);
  }
  return lastMoodByCharacterId;
}

/** 当前连续天数(截至 today;今天还没打卡则从昨天算起) */
export function getCurrentStreak(checkIns: readonly CheckIn[], today: DateKey): number {
  const countedDates = new Set(checkIns.filter((checkIn) => checkIn.counted).map((checkIn) => checkIn.date));
  const lastCountedDate = countedDates.has(today) ? today : [...countedDates].sort().pop();
  if (!lastCountedDate) return 0;
  const lastCheckIn = checkIns.find((checkIn) => checkIn.counted && checkIn.date === lastCountedDate);
  const isStillOngoing = lastCountedDate === today || addDays(lastCountedDate, 1) === today;
  return isStillOngoing && lastCheckIn ? lastCheckIn.streak : 0;
}
