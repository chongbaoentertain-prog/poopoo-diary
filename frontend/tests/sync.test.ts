import { describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../src/services/storage/memoryRepository';
import { createSyncEngine } from '../src/services/sync/syncEngine';
import { createMemorySyncMetaStore } from '../src/services/sync/syncMeta';
import { createAppStore } from '../src/stores/createAppStore';
import { createFakeSyncApi } from './fakeSyncApi';

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const MILLISECONDS_PER_DAY = 86_400_000;

/** 每次调用造一台"设备":自己的本地存档 + 自己的同步引擎,所有设备共用同一个假服务器 */
function createTestWorld() {
  const fakeServer = createFakeSyncApi();
  const createDevice = () => {
    const store = createAppStore(createMemoryRepository());
    const engine = createSyncEngine({ store, api: fakeServer.api, syncMetaStore: createMemorySyncMetaStore() });
    return { store, engine, getState: () => store.getState(), getSaveCode: () => engine.statusStore.getState().saveCode };
  };
  return { ...fakeServer, createDevice };
}
type Device = ReturnType<ReturnType<typeof createTestWorld>['createDevice']>;

const completeOnboardingOn = (device: Device, characterId = 'gold-ingot', nickname = '阿宝') =>
  device.getState().completeOnboarding({ nickname, avatarId: characterId }, characterId);

const firstVaultOf = (vaults: ReturnType<typeof createFakeSyncApi>['vaults']) => [...vaults.values()][0];
const allRowsAreDeleted = (vaults: ReturnType<typeof createFakeSyncApi>['vaults']) =>
  [...firstVaultOf(vaults).checkIns.values()].every((row) => row.isDeleted);

describe('多设备同步', () => {
  it('新设备输入存档码,恢复资料、角色和签到记录', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06', 'breakdown');
    await phone.engine.syncNow();

    const laptop = createDevice();
    expect((await laptop.engine.restoreFromSaveCode(phone.getSaveCode())).ok).toBe(true);
    expect(laptop.getState().profile?.nickname).toBe('阿宝');
    expect(laptop.getState().activeCharacterId).toBe('gold-ingot');
    expect(laptop.getState().checkIns.map((checkIn) => checkIn.stampId)).toEqual(['gold-ingot:1:breakdown']);
    expect(laptop.getState().progress[0].xp).toBe(10);
  });

  it('两台设备同一天各签一次:合并后两条记录,只有一条计经验', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    const laptop = createDevice();
    await laptop.engine.restoreFromSaveCode(phone.getSaveCode());

    phone.getState().checkIn('2026-10-08', 'refreshed');
    await wait(5);
    laptop.getState().checkIn('2026-10-08', 'deflated'); // 两边都以为自己是当天第一条
    await phone.engine.syncNow();
    await laptop.engine.syncNow();
    await phone.engine.syncNow();

    for (const device of [phone, laptop]) {
      const checkInsOnThatDay = device.getState().checkIns.filter((checkIn) => checkIn.date === '2026-10-08');
      expect(checkInsOnThatDay).toHaveLength(2);
      expect(checkInsOnThatDay.filter((checkIn) => checkIn.counted)).toHaveLength(1);
      expect(device.getState().progress[0].xp).toBe(10);
    }
    const sortedIds = (device: Device) => device.getState().checkIns.map((checkIn) => checkIn.id).sort();
    expect(sortedIds(phone)).toEqual(sortedIds(laptop));
  });

  it('资料后写者胜', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    const laptop = createDevice();
    await laptop.engine.restoreFromSaveCode(phone.getSaveCode());

    phone.getState().updateProfile({ nickname: '手机上改的' });
    await wait(5);
    laptop.getState().updateProfile({ nickname: '电脑上改的' });
    await laptop.engine.syncNow();
    await phone.engine.syncNow(); // 手机的改动更早,不能盖掉电脑的
    await laptop.engine.syncNow();
    expect(phone.getState().profile?.nickname).toBe('电脑上改的');
    expect(laptop.getState().profile?.nickname).toBe('电脑上改的');
  });

  it('毕业换角会同步:另一台设备也拥有新角色且当前角色跟着变', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    const laptop = createDevice();
    await laptop.engine.restoreFromSaveCode(phone.getSaveCode());

    await wait(5);
    // 经验由签到记录重算,所以满级状态要在换角前一刻直接写入
    phone.store.setState({ progress: [{ characterId: 'gold-ingot', xp: 1500, stage: 5, maxed: true, graduated: false }] });
    phone.getState().graduateAndChooseCharacter('wood-bamboo');
    await phone.engine.syncNow();
    await laptop.engine.syncNow();
    expect(laptop.getState().activeCharacterId).toBe('wood-bamboo');
    expect(laptop.getState().progress.find((entry) => entry.characterId === 'gold-ingot')?.graduated).toBe(true);
  });

  it('本机没有的数据不会反复推送', async () => {
    const { createDevice, controls } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06');
    await phone.engine.syncNow();
    controls.calledFunctionNames.length = 0;
    await phone.engine.syncNow();
    expect(controls.calledFunctionNames).toEqual(['pull']); // 没有新东西就只拉不推
  });
});

describe('离线', () => {
  it('离线时签到不受影响,联网后自动补推', async () => {
    const { createDevice, controls, vaults } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();

    controls.isOffline = true;
    phone.getState().checkIn('2026-10-06');
    await phone.engine.syncNow();
    expect(phone.engine.statusStore.getState().state).toBe('offline');
    expect(phone.getState().checkIns).toHaveLength(1);

    controls.isOffline = false;
    await phone.engine.syncNow();
    expect(phone.engine.statusStore.getState().state).toBe('idle');
    expect(firstVaultOf(vaults).checkIns.size).toBe(1);
  });

  it('恢复存档码时没网:提示联网,本地数据不动', async () => {
    const { createDevice, controls } = createTestWorld();
    const laptop = createDevice();
    completeOnboardingOn(laptop);
    controls.isOffline = true;
    const result = await laptop.engine.restoreFromSaveCode('0000-1111-2222-3333');
    expect(result).toMatchObject({ ok: false });
    expect(laptop.getState().profile?.nickname).toBe('阿宝');
  });
});

describe('清空全部数据(软删除)', () => {
  it('一台设备清空,另一台下次同步时也被清掉;云端只是打上删除标记', async () => {
    const { createDevice, vaults } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06');
    await phone.engine.syncNow();
    const laptop = createDevice();
    await laptop.engine.restoreFromSaveCode(phone.getSaveCode());
    expect(laptop.getState().checkIns).toHaveLength(1);

    phone.engine.clearAllData();
    await phone.engine.syncNow();
    expect(phone.getState().profile).toBeNull();
    expect(allRowsAreDeleted(vaults)).toBe(true); // 软删除:行还在
    expect(firstVaultOf(vaults).checkIns.size).toBe(1);

    await laptop.engine.syncNow();
    expect(laptop.getState().profile).toBeNull();
    expect(laptop.getState().checkIns).toHaveLength(0);
    expect(laptop.getState().progress).toHaveLength(0);
  });

  it('清空后马上重选同一只角色重新开始:不会被旧的删除标记误删,另一台设备也能拿到新数据', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06');
    await phone.engine.syncNow();
    const laptop = createDevice();
    await laptop.engine.restoreFromSaveCode(phone.getSaveCode());

    phone.engine.clearAllData();
    await phone.engine.syncNow();
    completeOnboardingOn(phone, 'gold-ingot', '新人');
    phone.getState().checkIn('2026-10-07');
    await phone.engine.syncNow();
    expect(phone.getState().progress.map((entry) => entry.characterId)).toEqual(['gold-ingot']);

    await laptop.engine.syncNow();
    expect(laptop.getState().profile?.nickname).toBe('新人');
    expect(laptop.getState().checkIns.map((checkIn) => checkIn.date)).toEqual(['2026-10-07']);
    expect(laptop.getState().progress.map((entry) => entry.characterId)).toEqual(['gold-ingot']);
  });

  it('离线时点清空:本地立刻清掉,联网后先通知服务器', async () => {
    const { createDevice, controls, vaults } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06');
    await phone.engine.syncNow();

    controls.isOffline = true;
    phone.engine.clearAllData();
    await phone.engine.syncNow();
    expect(phone.getState().checkIns).toHaveLength(0);
    expect(allRowsAreDeleted(vaults)).toBe(false); // 服务器还不知道

    controls.isOffline = false;
    await phone.engine.syncNow();
    expect(allRowsAreDeleted(vaults)).toBe(true);
    expect(phone.getState().checkIns).toHaveLength(0); // 清空后拉回来的是空的,不会把旧数据带回
  });

  it('新设备带着本地数据去恢复一个被清空过的存档码:本地数据不会被清掉', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    phone.engine.clearAllData();
    await phone.engine.syncNow();

    const tablet = createDevice();
    completeOnboardingOn(tablet, 'wood-bamboo', '路人');
    tablet.getState().checkIn('2026-10-06');
    await tablet.engine.restoreFromSaveCode(phone.getSaveCode());
    expect(tablet.getState().profile?.nickname).toBe('路人');
    expect(tablet.getState().checkIns).toHaveLength(1);
  });
});

describe('撤销清空(30 天内)', () => {
  it('清空后恢复:记录、角色、资料都回来,别的设备被清掉的也跟着回来', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06', 'breakdown');
    await phone.engine.syncNow();
    const laptop = createDevice();
    await laptop.engine.restoreFromSaveCode(phone.getSaveCode());

    phone.engine.clearAllData();
    await phone.engine.syncNow();
    await laptop.engine.syncNow();
    expect(laptop.getState().profile).toBeNull();
    expect(phone.engine.statusStore.getState().clearedAt).not.toBeNull();

    expect((await phone.engine.undoClearAllData()).ok).toBe(true);
    expect(phone.getState().profile?.nickname).toBe('阿宝');
    expect(phone.getState().checkIns.map((checkIn) => checkIn.stampId)).toEqual(['gold-ingot:1:breakdown']);
    expect(phone.getState().progress.map((entry) => entry.characterId)).toEqual(['gold-ingot']);
    expect(phone.engine.statusStore.getState().clearedAt).toBeNull();

    await laptop.engine.syncNow();
    expect(laptop.getState().profile?.nickname).toBe('阿宝');
    expect(laptop.getState().checkIns).toHaveLength(1);
  });

  it('清空后已经重新开始了,再恢复:新旧记录合并,资料以现在的为准', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone, 'gold-ingot', '旧');
    phone.getState().checkIn('2026-10-06');
    await phone.engine.syncNow();
    phone.engine.clearAllData();
    await phone.engine.syncNow();
    await wait(5);
    completeOnboardingOn(phone, 'wood-bamboo', '新');
    phone.getState().checkIn('2026-10-07');
    await phone.engine.syncNow();

    expect((await phone.engine.undoClearAllData()).ok).toBe(true);
    expect(phone.getState().profile?.nickname).toBe('新');
    expect(phone.getState().checkIns.map((checkIn) => checkIn.date).sort()).toEqual(['2026-10-06', '2026-10-07']);
    expect(phone.getState().progress.map((entry) => entry.characterId).sort()).toEqual(['gold-ingot', 'wood-bamboo']);
  });

  it('没清空过:提示没有可恢复的数据', async () => {
    const { createDevice } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    expect(await phone.engine.undoClearAllData()).toEqual({ ok: false, error: '没有可以恢复的数据' });
  });

  it('超过 30 天:提示数据已被永久清除', async () => {
    const { createDevice, controls } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    phone.engine.clearAllData();
    await phone.engine.syncNow();
    controls.clockMs += 31 * MILLISECONDS_PER_DAY;
    expect(await phone.engine.undoClearAllData()).toEqual({ ok: false, error: '已经超过 30 天,数据已被永久清除' });
  });

  it('离线时恢复:提示联网,不改任何东西', async () => {
    const { createDevice, controls } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    await phone.engine.syncNow();
    phone.engine.clearAllData();
    await phone.engine.syncNow();
    controls.isOffline = true;
    expect(await phone.engine.undoClearAllData()).toEqual({ ok: false, error: '现在连不上服务器,请联网后再试' });
    expect(phone.engine.statusStore.getState().clearedAt).not.toBeNull();
  });
});

describe('检查云端数据', () => {
  it('报告云端真实的记录数;空存档码和离线分别给出提示;不改动本地', async () => {
    const { createDevice, controls } = createTestWorld();
    const phone = createDevice();
    completeOnboardingOn(phone);
    phone.getState().checkIn('2026-10-06');
    phone.getState().checkIn('2026-10-07');
    // 还没同步,云端是空的
    expect(await phone.engine.verifyCloud()).toEqual({ ok: true, checkInCount: 0, characterCount: 0, nickname: null });

    await phone.engine.syncNow();
    expect(await phone.engine.verifyCloud()).toEqual({ ok: true, checkInCount: 2, characterCount: 1, nickname: '阿宝' });
    expect(phone.getState().checkIns).toHaveLength(2);

    controls.isOffline = true;
    expect(await phone.engine.verifyCloud()).toEqual({ ok: false, error: '现在连不上服务器,请联网后再试' });
  });
});
