import { getCharacter } from '../../data/characters';
import { DEFAULT_MOOD, MOODS } from '../../data/moods';
import { getWeekDateKeys } from '../../domain/calendarGrid';
import { compareByTime } from '../../domain/compareCheckIns';
import { addDays } from '../../domain/date';
import { parseStampId, type Stamp } from '../../domain/stamp';
import type { Mood } from '../../types/character';
import type { CheckIn, DateKey, Profile } from '../../types/diary';

/** 自定义范围最多 6 周,正好是一张卡片能放下的日历 */
export const MAX_SHARE_RANGE_DAYS = 42;

export type ShareRangeKind = 'day' | 'week' | 'month' | 'custom';

/** 某一天在卡片上的样子:角色/形态取当天第一次签到,心情取当天最新一次(和日历一致) */
export interface DayStamp extends Stamp {
  date: DateKey;
}

export interface ShareCardData {
  fromDate: DateKey;
  toDate: DateKey;
  dayStamps: (DayStamp | null)[]; // fromDate..toDate 每天一格,没签到为 null
  checkedInDayCount: number;
  longestStreak: number; // 范围内最长连续天数
  mostFrequentMood: { mood: Mood; count: number } | null;
  headlineStamp: DayStamp | null; // 范围内最近一次签到,卡片主角
  headlineStreak: number; // 主角那天的连续天数
  quote: string;
  nickname: string;
}

export interface CalendarCell {
  date: DateKey;
  stamp: DayStamp | null;
}

export function getShareDateRange(
  kind: ShareRangeKind,
  selectedDate: DateKey,
  today: DateKey,
  customRange: [DateKey, DateKey],
): [DateKey, DateKey] {
  if (kind === 'day') return [selectedDate, selectedDate];
  if (kind === 'week') return [addDays(today, -6), today];
  if (kind === 'month') return [`${today.slice(0, 7)}-01`, today];
  const [startDate, endDate] = customRange[0] <= customRange[1] ? customRange : [customRange[1], customRange[0]];
  const lastAllowedDate = addDays(startDate, MAX_SHARE_RANGE_DAYS - 1);
  return [startDate, endDate > lastAllowedDate ? lastAllowedDate : endDate];
}

/** 同一天同一角色的文案要稳定,不能每次打开预览都换一句 */
const hashText = (text: string) => [...text].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);

export function buildShareCardData(
  checkIns: readonly CheckIn[],
  profile: Profile | null,
  fromDate: DateKey,
  toDate: DateKey,
): ShareCardData {
  const checkInsByDate = new Map<DateKey, CheckIn[]>();
  const checkInsInRange = checkIns
    .filter((checkIn) => checkIn.date >= fromDate && checkIn.date <= toDate)
    .sort(compareByTime);
  for (const checkIn of checkInsInRange) {
    checkInsByDate.set(checkIn.date, [...(checkInsByDate.get(checkIn.date) ?? []), checkIn]);
  }

  const dayStamps: (DayStamp | null)[] = [];
  for (let date = fromDate; date <= toDate; date = addDays(date, 1)) {
    const dayCheckIns = checkInsByDate.get(date);
    if (!dayCheckIns) {
      dayStamps.push(null);
      continue;
    }
    const representativeCheckIn = dayCheckIns.find((checkIn) => checkIn.counted) ?? dayCheckIns[0];
    const { characterId, stage } = parseStampId(representativeCheckIn.stampId);
    const { mood } = parseStampId(dayCheckIns[dayCheckIns.length - 1].stampId);
    dayStamps.push({ date, characterId, stage, mood });
  }

  const checkedInStamps = dayStamps.filter((stamp): stamp is DayStamp => stamp !== null);

  let longestStreak = 0;
  let currentStreak = 0;
  for (const stamp of dayStamps) {
    currentStreak = stamp ? currentStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  const dayCountByMood = new Map<Mood, number>();
  for (const stamp of checkedInStamps) dayCountByMood.set(stamp.mood, (dayCountByMood.get(stamp.mood) ?? 0) + 1);
  // 并列时取更靠前(更好)的心情,所以按 MOODS 的顺序比较
  const mostFrequent = MOODS
    .map((option) => ({ mood: option.id, count: dayCountByMood.get(option.id) ?? 0 }))
    .reduce((best, candidate) => (candidate.count > best.count ? candidate : best), { mood: DEFAULT_MOOD, count: 0 });

  const headlineStamp = checkedInStamps[checkedInStamps.length - 1] ?? null;
  const headlineCountedCheckIn = headlineStamp ? checkInsByDate.get(headlineStamp.date)!.find((checkIn) => checkIn.counted) : undefined;
  const quotes = headlineStamp ? getCharacter(headlineStamp.characterId).quotes : [];

  return {
    fromDate,
    toDate,
    dayStamps,
    checkedInDayCount: checkedInStamps.length,
    longestStreak,
    mostFrequentMood: mostFrequent.count ? mostFrequent : null,
    headlineStamp,
    headlineStreak: headlineCountedCheckIn?.streak ?? 0,
    quote: headlineStamp ? quotes[hashText(`${headlineStamp.date}${headlineStamp.characterId}`) % quotes.length] : '',
    nickname: !profile || profile.anonymous || !profile.nickname ? '匿名噗友' : profile.nickname,
  };
}

/** 范围日历:周一开头,把 fromDate..toDate 补齐成整周;范围外的格子由画卡片的一方跳过 */
export function getCalendarWeeks(data: ShareCardData): CalendarCell[][] {
  const stampByDate = new Map(data.dayStamps.filter((stamp): stamp is DayStamp => stamp !== null).map((stamp) => [stamp.date, stamp]));
  const weeks: CalendarCell[][] = [];
  for (let weekStart = getWeekDateKeys(data.fromDate)[0]; weekStart <= data.toDate; weekStart = addDays(weekStart, 7)) {
    weeks.push(getWeekDateKeys(weekStart).map((date) => ({ date, stamp: stampByDate.get(date) ?? null })));
  }
  return weeks;
}

/** 按宽度折行(中文算 1,英文数字算 0.55),卡片是 SVG,没有自动换行 */
export function wrapText(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let currentWidth = 0;
  for (const character of text) {
    const characterWidth = character.charCodeAt(0) < 128 ? 0.55 : 1;
    if (currentWidth + characterWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = '';
      currentWidth = 0;
    }
    currentLine += character;
    currentWidth += characterWidth;
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
