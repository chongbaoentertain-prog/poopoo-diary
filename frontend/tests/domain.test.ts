import { describe, expect, it } from 'vitest';
import { recordCheckIn } from '../src/domain/recordCheckIn';
import { applyXp, graduate, newProgress, stageForXp } from '../src/domain/evolution';
import { streakOnDate } from '../src/domain/streak';
import { multiplierForStreak, xpForStreak } from '../src/domain/xp';
import type { CheckIn } from '../src/types/diary';

describe('xp', () => {
  it('连续 buff 叠加并在第 11 天封顶 2x', () => {
    expect(multiplierForStreak(1)).toBe(1);
    expect(multiplierForStreak(6)).toBe(1.5);
    expect(multiplierForStreak(11)).toBe(2);
    expect(multiplierForStreak(30)).toBe(2);
    expect(xpForStreak(11)).toBe(20);
  });
});

describe('streak', () => {
  it('连续与断签', () => {
    const set = new Set(['2026-10-05', '2026-10-06', '2026-10-07']);
    expect(streakOnDate('2026-10-08', set)).toBe(4);
    expect(streakOnDate('2026-10-10', set)).toBe(1);
  });
  it('跨月', () => {
    expect(streakOnDate('2026-11-01', new Set(['2026-10-31']))).toBe(2);
  });
});

describe('evolution', () => {
  it('门槛', () => {
    expect(stageForXp(99)).toBe(1);
    expect(stageForXp(100)).toBe(2);
    expect(stageForXp(1500)).toBe(5);
  });
  it('进化与满级后继续累积', () => {
    const r = applyXp({ ...newProgress('gold-ingot'), xp: 95 }, 10);
    expect(r.evolved).toBe(true);
    const maxed = applyXp({ ...newProgress('gold-ingot'), xp: 1490, stage: 4 }, 20);
    expect(maxed.reachedMax).toBe(true);
    expect(applyXp(maxed.progress, 20).progress.xp).toBe(1530);
  });
  it('未满级不能毕业', () => {
    expect(() => graduate(newProgress('gold-ingot'))).toThrow();
  });
});

describe('recordCheckIn', () => {
  const base = { progress: newProgress('gold-ingot'), stampId: 's1', now: new Date() };
  it('同一天第二次只记录不计经验', () => {
    const first = recordCheckIn({ ...base, existing: [], date: '2026-10-08', id: 'a' });
    expect(first.checkIn.counted).toBe(true);
    expect(first.checkIn.xpGained).toBe(10);
    const second = recordCheckIn({
      ...base,
      progress: first.progress,
      existing: [first.checkIn] as CheckIn[],
      date: '2026-10-08',
      id: 'b',
    });
    expect(second.checkIn.counted).toBe(false);
    expect(second.checkIn.xpGained).toBe(0);
    expect(second.progress.xp).toBe(10);
  });
});
