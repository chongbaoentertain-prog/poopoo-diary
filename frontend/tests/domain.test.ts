import { describe, expect, it } from 'vitest';
import { applyXp, createInitialProgress, graduate, stageForXp } from '../src/domain/evolution';
import { recordCheckIn } from '../src/domain/recordCheckIn';
import { streakOnDate } from '../src/domain/streak';
import { multiplierForStreak, xpForStreak } from '../src/domain/xp';
import type { CheckIn } from '../src/types/diary';

describe('xp', () => {
  it('连续奖励叠加并在第 11 天封顶 2x', () => {
    expect(multiplierForStreak(1)).toBe(1);
    expect(multiplierForStreak(6)).toBe(1.5);
    expect(multiplierForStreak(11)).toBe(2);
    expect(multiplierForStreak(30)).toBe(2);
    expect(xpForStreak(11)).toBe(20);
  });
});

describe('streak', () => {
  it('连续与断签', () => {
    const countedDates = new Set(['2026-10-05', '2026-10-06', '2026-10-07']);
    expect(streakOnDate('2026-10-08', countedDates)).toBe(4);
    expect(streakOnDate('2026-10-10', countedDates)).toBe(1);
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
    const evolution = applyXp({ ...createInitialProgress('gold-ingot'), xp: 95 }, 10);
    expect(evolution.evolved).toBe(true);
    const reachingMax = applyXp({ ...createInitialProgress('gold-ingot'), xp: 1490, stage: 4 }, 20);
    expect(reachingMax.reachedMax).toBe(true);
    expect(applyXp(reachingMax.progress, 20).progress.xp).toBe(1530);
  });
  it('未满级不能毕业', () => {
    expect(() => graduate(createInitialProgress('gold-ingot'))).toThrow();
  });
});

describe('recordCheckIn', () => {
  const sharedInput = { progress: createInitialProgress('gold-ingot'), stampId: 'stamp-1', recordedAt: new Date() };
  it('同一天第二次只记录不计经验', () => {
    const firstResult = recordCheckIn({ ...sharedInput, existingCheckIns: [], date: '2026-10-08', checkInId: 'first' });
    expect(firstResult.checkIn.counted).toBe(true);
    expect(firstResult.checkIn.xpGained).toBe(10);

    const secondResult = recordCheckIn({
      ...sharedInput,
      progress: firstResult.progress,
      existingCheckIns: [firstResult.checkIn] as CheckIn[],
      date: '2026-10-08',
      checkInId: 'second',
    });
    expect(secondResult.checkIn.counted).toBe(false);
    expect(secondResult.checkIn.xpGained).toBe(0);
    expect(secondResult.progress.xp).toBe(10);
  });
});
