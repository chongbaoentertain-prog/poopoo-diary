import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../src/data/characters';
import type { CheckIn } from '../src/domain/types';
import { buildShareData, calendarCells, MAX_SHARE_DAYS, rangeFor, wrapText } from '../src/features/share/cardData';

let n = 0;
const ci = (date: string, mood: string, over: Partial<CheckIn> = {}): CheckIn => ({
  id: `c${n++}`, date, at: `${date}T0${n % 10}:00:00Z`, characterId: 'weak-worker', stampId: `weak-worker:3:${mood}`,
  counted: true, xpGained: 10, streak: 1, multiplier: 1, ...over,
});

describe('分享卡片数据', () => {
  it('同一天签两次,心情取最新一次,角色形态取第一次', () => {
    const list = [ci('2026-10-08', 'happy', { stampId: 'weak-worker:3:happy', at: '2026-10-08T08:00:00Z' }),
      ci('2026-10-08', 'dizzy', { stampId: 'weak-worker:4:dizzy', at: '2026-10-08T20:00:00Z', counted: false })];
    const d = buildShareData(list, null, '2026-10-08', '2026-10-08');
    expect(d.headline).toMatchObject({ stage: 3, mood: 'dizzy' });
  });

  it('统计签到天数、范围内最长连续、最常心情', () => {
    const list = [ci('2026-10-01', 'happy'), ci('2026-10-02', 'sad'), ci('2026-10-03', 'sad'), ci('2026-10-05', 'happy'), ci('2026-09-30', 'dizzy')];
    const d = buildShareData(list, null, '2026-10-01', '2026-10-07');
    expect(d.days).toHaveLength(7);
    expect(d.checkedDays).toBe(4);
    expect(d.longest).toBe(3);
    expect(d.topMood).toEqual({ mood: 'happy', count: 2 }); // 并列时取更好的心情
  });

  it('没有签到时没有主角;昵称遵守匿名设置', () => {
    const d = buildShareData([], { nickname: '小明', avatarId: 'x', anonymous: true }, '2026-10-01', '2026-10-01');
    expect(d.headline).toBeNull();
    expect(d.nickname).toBe('匿名噗友');
    expect(buildShareData([], { nickname: '小明', avatarId: 'x' }, '2026-10-01', '2026-10-01').nickname).toBe('小明');
  });

  it('同一天同一角色的文案是稳定的,且来自该角色', () => {
    const list = [ci('2026-10-08', 'happy')];
    const a = buildShareData(list, null, '2026-10-08', '2026-10-08').quote;
    expect(buildShareData(list, null, '2026-10-08', '2026-10-08').quote).toBe(a);
    expect(CHARACTERS.find((c) => c.id === 'weak-worker')!.quotes).toContain(a);
  });

  it('范围:预设和自定义上限', () => {
    expect(rangeFor('day', '2026-10-03', '2026-10-08', ['', ''])).toEqual(['2026-10-03', '2026-10-03']);
    expect(rangeFor('week', '', '2026-10-08', ['', ''])).toEqual(['2026-10-02', '2026-10-08']);
    expect(rangeFor('month', '', '2026-10-08', ['', ''])).toEqual(['2026-10-01', '2026-10-08']);
    const [a, b] = rangeFor('custom', '', '2026-12-31', ['2026-12-01', '2026-06-01']); // 反过来填也行
    expect(a).toBe('2026-06-01');
    expect(b).toBe('2026-07-12');
    expect(MAX_SHARE_DAYS).toBe(42);
  });

  it('日历补齐成整周,周一开头', () => {
    const cells = calendarCells(buildShareData([], null, '2026-10-08', '2026-10-14')); // 周四 ~ 下周三
    expect(cells).toHaveLength(2);
    expect(cells[0][0].date).toBe('2026-10-05');
  });

  it('折行:中文按字数,英文数字占半格', () => {
    expect(wrapText('一二三四五六', 4)).toEqual(['一二三四', '五六']);
    expect(wrapText('KPI 完不成', 15)).toEqual(['KPI 完不成']);
  });
});
