import { charDef, MOODS, type Mood } from '../../data/characters';
import { addDays } from '../../domain/date';
import type { CheckIn, Profile } from '../../domain/types';
import { weekDays } from '../calendar/grid';

/** 自定义范围最多 6 周,正好是一张卡片能放下的日历 */
export const MAX_SHARE_DAYS = 42;

export type RangeKind = 'day' | 'week' | 'month' | 'custom';

/** 某一天在卡片上的样子:角色/形态取当天第一次签到,心情取当天最新一次(和日历一致) */
export interface DayStamp { date: string; characterId: string; stage: number; mood: Mood }

export interface ShareData {
  from: string;
  to: string;
  days: (DayStamp | null)[]; // from..to 每天一格,没签到为 null
  checkedDays: number;
  longest: number; // 范围内最长连续天数
  topMood: { mood: Mood; count: number } | null;
  headline: DayStamp | null; // 范围内最近一次签到,卡片主角
  streak: number; // 主角那天的连续天数
  quote: string;
  nickname: string;
}

export function rangeFor(kind: RangeKind, selected: string, today: string, custom: [string, string]): [string, string] {
  if (kind === 'day') return [selected, selected];
  if (kind === 'week') return [addDays(today, -6), today];
  if (kind === 'month') return [`${today.slice(0, 7)}-01`, today];
  const [a, b] = custom[0] <= custom[1] ? custom : [custom[1], custom[0]];
  const last = addDays(a, MAX_SHARE_DAYS - 1);
  return [a, b > last ? last : b];
}

/** 同一天同一角色的文案要稳定,不能每次打开预览都换一句 */
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function buildShareData(checkIns: readonly CheckIn[], profile: Profile | null, from: string, to: string): ShareData {
  const byDate = new Map<string, CheckIn[]>();
  for (const c of [...checkIns].filter((x) => x.date >= from && x.date <= to).sort((a, b) => a.at.localeCompare(b.at))) {
    byDate.set(c.date, [...(byDate.get(c.date) ?? []), c]);
  }

  const days: (DayStamp | null)[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const list = byDate.get(d);
    if (!list) { days.push(null); continue; }
    const first = list.find((c) => c.counted) ?? list[0];
    const [characterId, stage] = first.stampId.split(':');
    days.push({ date: d, characterId, stage: +stage, mood: list[list.length - 1].stampId.split(':')[2] as Mood });
  }

  const stamped = days.filter((d): d is DayStamp => d !== null);
  let longest = 0, run = 0;
  days.forEach((d) => { run = d ? run + 1 : 0; longest = Math.max(longest, run); });

  const moodCount = new Map<Mood, number>();
  for (const d of stamped) moodCount.set(d.mood, (moodCount.get(d.mood) ?? 0) + 1);
  const top = MOODS.map((m) => ({ mood: m.id, count: moodCount.get(m.id) ?? 0 })).reduce((a, b) => (b.count > a.count ? b : a), { mood: 'happy' as Mood, count: 0 });

  const headline = stamped[stamped.length - 1] ?? null;
  const counted = headline ? byDate.get(headline.date)!.find((c) => c.counted) : undefined;
  const quotes = headline ? charDef(headline.characterId).quotes : [];

  return {
    from, to, days, checkedDays: stamped.length, longest,
    topMood: top.count ? top : null,
    headline,
    streak: counted?.streak ?? 0,
    quote: headline ? quotes[hash(`${headline.date}${headline.characterId}`) % quotes.length] : '',
    nickname: !profile || profile.anonymous || !profile.nickname ? '匿名噗友' : profile.nickname,
  };
}

/** 范围日历:周一开头,把 from..to 补齐成整周;范围外的格子为 null */
export function calendarCells(data: ShareData): { date: string; stamp: DayStamp | null }[][] {
  const stampOf = new Map(data.days.filter((d): d is DayStamp => d !== null).map((d) => [d.date, d]));
  const weeks: { date: string; stamp: DayStamp | null }[][] = [];
  for (let c = weekDays(data.from)[0]; c <= data.to; c = addDays(c, 7)) {
    weeks.push(weekDays(c).map((date) => ({ date, stamp: stampOf.get(date) ?? null })));
  }
  return weeks;
}

/** 按宽度折行(中文算 1,英文数字算 0.55),卡片是 SVG,没有自动换行 */
export function wrapText(text: string, limit: number): string[] {
  const lines: string[] = [];
  let line = '', w = 0;
  for (const ch of text) {
    const cw = ch.charCodeAt(0) < 128 ? 0.55 : 1;
    if (w + cw > limit && line) { lines.push(line); line = ''; w = 0; }
    line += ch; w += cw;
  }
  if (line) lines.push(line);
  return lines;
}
