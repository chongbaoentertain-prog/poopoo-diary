import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../src/data/characters';
import {
  buildShareCardData,
  getCalendarWeeks,
  getShareDateRange,
  MAX_SHARE_RANGE_DAYS,
  wrapText,
} from '../src/features/share/shareCardData';
import type { CheckIn } from '../src/types/diary';

let createdCheckInCount = 0;
const createCheckIn = (date: string, mood: string, overrides: Partial<CheckIn> = {}): CheckIn => ({
  id: `check-in-${createdCheckInCount++}`,
  date,
  at: `${date}T0${createdCheckInCount % 10}:00:00Z`,
  characterId: 'weak-worker',
  stampId: `weak-worker:3:${mood}`,
  counted: true,
  xpGained: 10,
  streak: 1,
  multiplier: 1,
  ...overrides,
});

describe('分享卡片数据', () => {
  it('同一天签两次,心情取最新一次,角色形态取第一次', () => {
    const checkIns = [
      createCheckIn('2026-10-08', 'refreshed', { stampId: 'weak-worker:3:refreshed', at: '2026-10-08T08:00:00Z' }),
      createCheckIn('2026-10-08', 'breakdown', { stampId: 'weak-worker:4:breakdown', at: '2026-10-08T20:00:00Z', counted: false }),
    ];
    const cardData = buildShareCardData(checkIns, null, '2026-10-08', '2026-10-08');
    expect(cardData.headlineStamp).toMatchObject({ stage: 3, mood: 'breakdown' });
  });

  it('统计签到天数、范围内最长连续、最常心情', () => {
    const checkIns = [
      createCheckIn('2026-10-01', 'refreshed'),
      createCheckIn('2026-10-02', 'deflated'),
      createCheckIn('2026-10-03', 'deflated'),
      createCheckIn('2026-10-05', 'refreshed'),
      createCheckIn('2026-09-30', 'breakdown'), // 范围外,不统计
    ];
    const cardData = buildShareCardData(checkIns, null, '2026-10-01', '2026-10-07');
    expect(cardData.dayStamps).toHaveLength(7);
    expect(cardData.checkedInDayCount).toBe(4);
    expect(cardData.longestStreak).toBe(3);
    expect(cardData.mostFrequentMood).toEqual({ mood: 'refreshed', count: 2 }); // 并列时取更好的心情
  });

  it('旧版本签的记录里的旧心情名字,也能被正确读出', () => {
    const cardData = buildShareCardData([createCheckIn('2026-10-08', 'dizzy')], null, '2026-10-08', '2026-10-08');
    expect(cardData.headlineStamp?.mood).toBe('breakdown');
  });

  it('没有签到时没有主角;昵称遵守匿名设置', () => {
    const anonymousCardData = buildShareCardData([], { nickname: '小明', avatarId: 'x', anonymous: true }, '2026-10-01', '2026-10-01');
    expect(anonymousCardData.headlineStamp).toBeNull();
    expect(anonymousCardData.nickname).toBe('匿名噗友');
    expect(buildShareCardData([], { nickname: '小明', avatarId: 'x' }, '2026-10-01', '2026-10-01').nickname).toBe('小明');
  });

  it('同一天同一角色的文案是稳定的,且来自该角色', () => {
    const checkIns = [createCheckIn('2026-10-08', 'refreshed')];
    const firstQuote = buildShareCardData(checkIns, null, '2026-10-08', '2026-10-08').quote;
    expect(buildShareCardData(checkIns, null, '2026-10-08', '2026-10-08').quote).toBe(firstQuote);
    expect(CHARACTERS.find((character) => character.id === 'weak-worker')!.quotes).toContain(firstQuote);
  });

  it('范围:预设和自定义上限', () => {
    const unusedCustomRange: [string, string] = ['', ''];
    expect(getShareDateRange('day', '2026-10-03', '2026-10-08', unusedCustomRange)).toEqual(['2026-10-03', '2026-10-03']);
    expect(getShareDateRange('week', '', '2026-10-08', unusedCustomRange)).toEqual(['2026-10-02', '2026-10-08']);
    expect(getShareDateRange('month', '', '2026-10-08', unusedCustomRange)).toEqual(['2026-10-01', '2026-10-08']);

    const [startDate, endDate] = getShareDateRange('custom', '', '2026-12-31', ['2026-12-01', '2026-06-01']); // 日期反过来填也行
    expect(startDate).toBe('2026-06-01');
    expect(endDate).toBe('2026-07-12');
    expect(MAX_SHARE_RANGE_DAYS).toBe(42);
  });

  it('日历补齐成整周,周一开头', () => {
    const weeks = getCalendarWeeks(buildShareCardData([], null, '2026-10-08', '2026-10-14')); // 周四 ~ 下周三
    expect(weeks).toHaveLength(2);
    expect(weeks[0][0].date).toBe('2026-10-05');
  });

  it('折行:中文按字数,英文数字占半格', () => {
    expect(wrapText('一二三四五六', 4)).toEqual(['一二三四', '五六']);
    expect(wrapText('KPI 完不成', 15)).toEqual(['KPI 完不成']);
  });
});
