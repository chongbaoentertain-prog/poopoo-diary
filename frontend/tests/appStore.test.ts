import { describe, expect, it } from 'vitest';
import { addDays } from '../src/domain/date';
import { createMemoryRepository } from '../src/services/storage/memoryRepository';
import { createAppStore } from '../src/stores/createAppStore';
import { getCurrentStreak, groupCheckInsByDate } from '../src/stores/selectors';
import type { DateKey } from '../src/types/diary';

const createOnboardedStore = () => {
  const repository = createMemoryRepository();
  const store = createAppStore(repository);
  store.getState().completeOnboarding({ nickname: '', avatarId: 'gold-ingot' }, 'gold-ingot');
  return { repository, store };
};

const dateRange = (firstDate: DateKey, lastDate: DateKey): DateKey[] => {
  const dates: DateKey[] = [];
  for (let date = firstDate; date <= lastDate; date = addDays(date, 1)) dates.push(date);
  return dates;
};

describe('appStore', () => {
  it('连续打卡叠加奖励并持久化', () => {
    const { repository, store } = createOnboardedStore();
    store.getState().checkIn('2026-10-06');
    store.getState().checkIn('2026-10-07');
    const thirdResult = store.getState().checkIn('2026-10-08');
    expect(thirdResult.checkIn.streak).toBe(3);
    expect(thirdResult.checkIn.xpGained).toBe(12);
    expect(repository.load().checkIns).toHaveLength(3);
  });

  it('同一天多次记录,只计一次', () => {
    const { store } = createOnboardedStore();
    store.getState().checkIn('2026-10-08');
    store.getState().checkIn('2026-10-08');
    const state = store.getState();
    expect(state.checkIns).toHaveLength(2);
    expect(state.progress[0].xp).toBe(10);
    expect(groupCheckInsByDate(state.checkIns).get('2026-10-08')).toHaveLength(2);
  });

  it('满级前不能换角色;满级后毕业并选新角色', () => {
    const { store } = createOnboardedStore();
    expect(() => store.getState().graduateAndChooseCharacter('wood-bamboo')).toThrow();
    store.setState({ progress: [{ characterId: 'gold-ingot', xp: 1500, stage: 5, maxed: true, graduated: false }] });
    store.getState().graduateAndChooseCharacter('wood-bamboo');
    const state = store.getState();
    expect(state.activeCharacterId).toBe('wood-bamboo');
    expect(state.progress.find((entry) => entry.characterId === 'gold-ingot')?.graduated).toBe(true);
    expect(() => store.getState().graduateAndChooseCharacter('gold-ingot')).toThrow();
  });

  it('getCurrentStreak:今天没打卡时昨天仍算连续', () => {
    const { store } = createOnboardedStore();
    store.getState().checkIn('2026-10-07');
    expect(getCurrentStreak(store.getState().checkIns, '2026-10-08')).toBe(1);
    expect(getCurrentStreak(store.getState().checkIns, '2026-10-09')).toBe(0);
  });
});

describe('连续打卡不因跨月重置', () => {
  it('先补 9 月再补 6-8 月,9/30 仍是连续 122 天、2x', () => {
    const { store } = createOnboardedStore();
    expect(store.getState().checkInOnDates(dateRange('2026-09-01', '2026-09-30')).addedDayCount).toBe(30);
    store.getState().checkInOnDates(dateRange('2026-06-01', '2026-08-31'));
    const lastDayOfSeptember = store.getState().checkIns.find((checkIn) => checkIn.date === '2026-09-30')!;
    expect(lastDayOfSeptember.streak).toBe(122);
    expect(lastDayOfSeptember.multiplier).toBe(2);
  });
  it('批量打卡跳过已打卡的日子', () => {
    const { store } = createOnboardedStore();
    store.getState().checkIn('2026-09-01');
    expect(store.getState().checkInOnDates(dateRange('2026-09-01', '2026-09-03')).addedDayCount).toBe(2);
  });
});

describe('心情', () => {
  it('签到时选的心情写进印章,不选默认舒畅', () => {
    const { store } = createOnboardedStore();
    expect(store.getState().checkIn('2026-10-06', 'breakdown').checkIn.stampId).toBe('gold-ingot:1:breakdown');
    expect(store.getState().checkIn('2026-10-07').checkIn.stampId).toBe('gold-ingot:1:refreshed');
  });
});

describe('读档时清理已下架角色', () => {
  const savedStateWith = (characterIds: string[], activeCharacterId: string) => ({
    version: 1 as const,
    profile: { nickname: '', avatarId: activeCharacterId },
    activeCharacterId,
    checkIns: [],
    progress: characterIds.map((characterId) => ({ characterId, xp: 0, stage: 1, maxed: false, graduated: false })),
  });
  const REMOVED_CHARACTER_ID = 'gold2'; // beta 早期的角色 id,现在已下架

  it('旧角色全部下架:回到初始状态重新选角', () => {
    const state = createAppStore(createMemoryRepository(savedStateWith([REMOVED_CHARACTER_ID], REMOVED_CHARACTER_ID))).getState();
    expect(state.profile).toBeNull();
    expect(state.progress).toHaveLength(0);
  });
  it('当前角色下架但还有别的:切到剩下的那只,头像一并修正', () => {
    const state = createAppStore(
      createMemoryRepository(savedStateWith([REMOVED_CHARACTER_ID, 'wood-bamboo'], REMOVED_CHARACTER_ID)),
    ).getState();
    expect(state.activeCharacterId).toBe('wood-bamboo');
    expect(state.profile?.avatarId).toBe('wood-bamboo');
    expect(state.progress.map((entry) => entry.characterId)).toEqual(['wood-bamboo']);
  });
});
