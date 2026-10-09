import { describe, expect, it } from 'vitest';
import { createMemoryRepo } from '../src/services/storage/memoryRepository';
import { createAppStore } from '../src/stores/createAppStore';
import { currentStreak, groupByDate } from '../src/stores/selectors';

const setup = () => {
  const repo = createMemoryRepo();
  const store = createAppStore(repo);
  store.getState().completeOnboarding({ nickname: '', avatarId: 'a1' }, 'gold-ingot');
  return { repo, store };
};

describe('appStore', () => {
  it('连续打卡叠加 buff 并持久化', () => {
    const { repo, store } = setup();
    store.getState().checkIn('2026-10-06');
    store.getState().checkIn('2026-10-07');
    const r = store.getState().checkIn('2026-10-08');
    expect(r.checkIn.streak).toBe(3);
    expect(r.checkIn.xpGained).toBe(12);
    expect(repo.load().checkIns).toHaveLength(3);
  });

  it('同一天多次记录,只计一次', () => {
    const { store } = setup();
    store.getState().checkIn('2026-10-08');
    store.getState().checkIn('2026-10-08');
    const s = store.getState();
    expect(s.checkIns).toHaveLength(2);
    expect(s.progress[0].xp).toBe(10);
    expect(groupByDate(s.checkIns).get('2026-10-08')).toHaveLength(2);
  });

  it('满级前不能换角色;满级后毕业并选新角色', () => {
    const { store } = setup();
    expect(() => store.getState().graduateAndPick('wood-bamboo')).toThrow();
    store.setState({ progress: [{ characterId: 'gold-ingot', xp: 1500, stage: 5, maxed: true, graduated: false }] });
    store.getState().graduateAndPick('wood-bamboo');
    const s = store.getState();
    expect(s.activeCharacterId).toBe('wood-bamboo');
    expect(s.progress.find((p) => p.characterId === 'gold-ingot')?.graduated).toBe(true);
    expect(() => store.getState().graduateAndPick('gold-ingot')).toThrow();
  });

  it('currentStreak:今天没打卡时昨天仍算连续', () => {
    const { store } = setup();
    store.getState().checkIn('2026-10-07');
    expect(currentStreak(store.getState().checkIns, '2026-10-08')).toBe(1);
    expect(currentStreak(store.getState().checkIns, '2026-10-09')).toBe(0);
  });
});

import { addDays } from '../src/domain/date';
const range = (a: string, b: string) => { const o: string[] = []; for (let d = a; d <= b; d = addDays(d, 1)) o.push(d); return o; };

describe('连续打卡不因跨月重置', () => {
  it('先补 9 月再补 6-8 月,9/30 仍是连续 122 天、2x', () => {
    const { store } = setup();
    expect(store.getState().checkInMany(range('2026-09-01', '2026-09-30')).added).toBe(30);
    store.getState().checkInMany(range('2026-06-01', '2026-08-31'));
    const last = store.getState().checkIns.find((c) => c.date === '2026-09-30')!;
    expect(last.streak).toBe(122);
    expect(last.multiplier).toBe(2);
  });
  it('批量打卡跳过已打卡的日子', () => {
    const { store } = setup();
    store.getState().checkIn('2026-09-01');
    expect(store.getState().checkInMany(range('2026-09-01', '2026-09-03')).added).toBe(2);
  });
});

describe('心情', () => {
  it('签到时选的心情写进印章,不选默认开心', () => {
    const { store } = setup();
    expect(store.getState().checkIn('2026-10-06', 'dizzy').checkIn.stampId).toBe('gold-ingot:1:dizzy');
    expect(store.getState().checkIn('2026-10-07').checkIn.stampId).toBe('gold-ingot:1:happy');
  });
});

describe('读档时清理已下架角色', () => {
  const old = (progress: { characterId: string }[], active: string) => ({
    version: 1 as const, profile: { nickname: '', avatarId: active }, activeCharacterId: active, checkIns: [],
    progress: progress.map((p) => ({ ...p, xp: 0, stage: 1, maxed: false, graduated: false })),
  });
  it('旧角色全部下架:回到初始状态重新选角', () => {
    const s = createAppStore(createMemoryRepo(old([{ characterId: 'gold2' }], 'gold2'))).getState();
    expect(s.profile).toBeNull();
    expect(s.progress).toHaveLength(0);
  });
  it('当前角色下架但还有别的:切到剩下的那只,头像一并修正', () => {
    const s = createAppStore(createMemoryRepo(old([{ characterId: 'gold2' }, { characterId: 'wood-bamboo' }], 'gold2'))).getState();
    expect(s.activeCharacterId).toBe('wood-bamboo');
    expect(s.profile?.avatarId).toBe('wood-bamboo');
    expect(s.progress.map((p) => p.characterId)).toEqual(['wood-bamboo']);
  });
});
