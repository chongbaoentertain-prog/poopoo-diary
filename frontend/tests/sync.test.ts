import { describe, expect, it } from 'vitest';
import { createMemoryRepo } from '../src/storage/memoryRepo';
import { createAppStore } from '../src/store/appStore';
import { codeToKey, generateCode, normalizeCode } from '../src/sync/code';
import { createSyncEngine } from '../src/sync/engine';
import { createMemoryMeta } from '../src/sync/meta';
import { createFakeBackend } from './fakeBackend';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 一台"设备":自己的本地存档 + 自己的同步引擎,共用同一个假服务器 */
function setup() {
  const fake = createFakeBackend();
  const device = () => {
    const store = createAppStore(createMemoryRepo());
    const engine = createSyncEngine({ store, backend: fake.backend, metaStore: createMemoryMeta() });
    return { store, engine, get: () => store.getState() };
  };
  return { ...fake, device };
}
type Device = ReturnType<ReturnType<typeof setup>['device']>;
const onboard = (d: Device, character = 'gold-ingot', nickname = '阿宝') =>
  d.get().completeOnboarding({ nickname, avatarId: character }, character);

describe('存档码', () => {
  it('生成的码格式正确,且能被规范化(容错大小写、空格、O/0、I/L/1)', () => {
    const code = generateCode();
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/);
    expect(normalizeCode(code.toLowerCase().replace(/-/g, ' '))).toBe(code);
    expect(normalizeCode('oooo-iiii-llll-1111')).toBe('0000-1111-1111-1111');
    expect(normalizeCode('太短了')).toBeNull();
    expect(normalizeCode('UUUU-UUUU-UUUU-UUUU')).toBeNull(); // U 不在字母表里
  });
  it('key 是 64 位十六进制,同一个码得到同一个 key,服务器拿不到码本身', async () => {
    const key = await codeToKey('0000-1111-2222-3333');
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(await codeToKey('0000-1111-2222-3333')).toBe(key);
    expect(key).not.toContain('0000');
  });
});

describe('多设备同步', () => {
  it('新设备输入存档码,恢复资料、角色和签到记录', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06', 'dizzy');
    await a.engine.syncNow();

    const b = device();
    expect((await b.engine.restore(a.engine.status.getState().code)).ok).toBe(true);
    expect(b.get().profile?.nickname).toBe('阿宝');
    expect(b.get().activeCharacterId).toBe('gold-ingot');
    expect(b.get().checkIns.map((c) => c.stampId)).toEqual(['gold-ingot:1:dizzy']);
    expect(b.get().progress[0].xp).toBe(10);
  });

  it('两台设备同一天各签一次:合并后两条记录,只有一条计经验', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    const b = device();
    await b.engine.restore(a.engine.status.getState().code);

    a.get().checkIn('2026-10-08', 'happy');
    await sleep(5);
    b.get().checkIn('2026-10-08', 'sad'); // 两边都以为自己是当天第一条
    await a.engine.syncNow();
    await b.engine.syncNow();
    await a.engine.syncNow();

    for (const d of [a, b]) {
      const day = d.get().checkIns.filter((c) => c.date === '2026-10-08');
      expect(day).toHaveLength(2);
      expect(day.filter((c) => c.counted)).toHaveLength(1);
      expect(d.get().progress[0].xp).toBe(10);
    }
    expect(a.get().checkIns.map((c) => c.id).sort()).toEqual(b.get().checkIns.map((c) => c.id).sort());
  });

  it('资料后写者胜', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    const b = device();
    await b.engine.restore(a.engine.status.getState().code);

    a.get().updateProfile({ nickname: '甲' });
    await sleep(5);
    b.get().updateProfile({ nickname: '乙' });
    await b.engine.syncNow();
    await a.engine.syncNow(); // 甲的改动更早,不能盖掉乙
    await b.engine.syncNow();
    expect(a.get().profile?.nickname).toBe('乙');
    expect(b.get().profile?.nickname).toBe('乙');
  });

  it('毕业换角会同步:另一台设备也拥有新角色且当前角色跟着变', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    const b = device();
    await b.engine.restore(a.engine.status.getState().code);

    await sleep(5);
    // 经验由签到记录重算,所以满级状态要在换角前一刻直接写入
    a.store.setState({ progress: [{ characterId: 'gold-ingot', xp: 1500, stage: 5, maxed: true, graduated: false }] });
    a.get().graduateAndPick('wood-bamboo');
    await a.engine.syncNow();
    await b.engine.syncNow();
    expect(b.get().activeCharacterId).toBe('wood-bamboo');
    expect(b.get().progress.find((p) => p.characterId === 'gold-ingot')?.graduated).toBe(true);
  });

  it('本机没有的数据不会反复推送', async () => {
    const { device, ctl } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06');
    await a.engine.syncNow();
    ctl.calls.length = 0;
    await a.engine.syncNow();
    expect(ctl.calls).toEqual(['pull']); // 没有新东西就只拉不推
  });
});

describe('离线', () => {
  it('离线时签到不受影响,联网后自动补推', async () => {
    const { device, ctl, vaults } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();

    ctl.offline = true;
    a.get().checkIn('2026-10-06');
    await a.engine.syncNow();
    expect(a.engine.status.getState().state).toBe('offline');
    expect(a.get().checkIns).toHaveLength(1);

    ctl.offline = false;
    await a.engine.syncNow();
    expect(a.engine.status.getState().state).toBe('idle');
    expect([...[...vaults.values()][0].checkIns.values()]).toHaveLength(1);
  });

  it('恢复存档码时没网:提示联网,本地数据不动', async () => {
    const { device, ctl } = setup();
    const b = device();
    onboard(b);
    ctl.offline = true;
    const r = await b.engine.restore('0000-1111-2222-3333');
    expect(r).toMatchObject({ ok: false });
    expect(b.get().profile?.nickname).toBe('阿宝');
  });
});

describe('清空全部数据(软删除)', () => {
  it('一台设备清空,另一台下次同步时也被清掉;云端只是打上删除标记', async () => {
    const { device, vaults } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06');
    await a.engine.syncNow();
    const b = device();
    await b.engine.restore(a.engine.status.getState().code);
    expect(b.get().checkIns).toHaveLength(1);

    a.engine.clearAll();
    await a.engine.syncNow();
    expect(a.get().profile).toBeNull();
    const vault = [...vaults.values()][0];
    expect([...vault.checkIns.values()].every((r) => r.deleted)).toBe(true); // 软删除:行还在
    expect(vault.checkIns.size).toBe(1);

    await b.engine.syncNow();
    expect(b.get().profile).toBeNull();
    expect(b.get().checkIns).toHaveLength(0);
    expect(b.get().progress).toHaveLength(0);
  });

  it('清空后马上重选同一只角色重新开始:不会被旧的删除标记误删,另一台设备也能拿到新数据', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06');
    await a.engine.syncNow();
    const b = device();
    await b.engine.restore(a.engine.status.getState().code);

    a.engine.clearAll();
    await a.engine.syncNow();
    onboard(a, 'gold-ingot', '新人');
    a.get().checkIn('2026-10-07');
    await a.engine.syncNow();
    expect(a.get().progress.map((p) => p.characterId)).toEqual(['gold-ingot']);

    await b.engine.syncNow();
    expect(b.get().profile?.nickname).toBe('新人');
    expect(b.get().checkIns.map((c) => c.date)).toEqual(['2026-10-07']);
    expect(b.get().progress.map((p) => p.characterId)).toEqual(['gold-ingot']);
  });

  it('离线时点清空:本地立刻清掉,联网后先通知服务器', async () => {
    const { device, ctl, vaults } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06');
    await a.engine.syncNow();

    ctl.offline = true;
    a.engine.clearAll();
    await a.engine.syncNow();
    expect(a.get().checkIns).toHaveLength(0);
    expect([...[...vaults.values()][0].checkIns.values()].every((r) => r.deleted)).toBe(false); // 服务器还不知道

    ctl.offline = false;
    await a.engine.syncNow();
    expect([...[...vaults.values()][0].checkIns.values()].every((r) => r.deleted)).toBe(true);
    expect(a.get().checkIns).toHaveLength(0); // 清空后拉回来的是空的,不会把旧数据带回
  });

  it('新设备带着本地数据去恢复一个被清空过的存档码:本地数据不会被清掉', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    a.engine.clearAll();
    await a.engine.syncNow();

    const c = device();
    onboard(c, 'wood-bamboo', '路人');
    c.get().checkIn('2026-10-06');
    await c.engine.restore(a.engine.status.getState().code);
    expect(c.get().profile?.nickname).toBe('路人');
    expect(c.get().checkIns).toHaveLength(1);
  });
});

describe('撤销清空(30 天内)', () => {
  it('清空后恢复:记录、角色、资料都回来,别的设备被清掉的也跟着回来', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06', 'dizzy');
    await a.engine.syncNow();
    const b = device();
    await b.engine.restore(a.engine.status.getState().code);

    a.engine.clearAll();
    await a.engine.syncNow();
    await b.engine.syncNow();
    expect(b.get().profile).toBeNull();
    expect(a.engine.status.getState().clearedAt).not.toBeNull();

    expect((await a.engine.undoClear()).ok).toBe(true);
    expect(a.get().profile?.nickname).toBe('阿宝');
    expect(a.get().checkIns.map((c) => c.stampId)).toEqual(['gold-ingot:1:dizzy']);
    expect(a.get().progress.map((p) => p.characterId)).toEqual(['gold-ingot']);
    expect(a.engine.status.getState().clearedAt).toBeNull();

    await b.engine.syncNow();
    expect(b.get().profile?.nickname).toBe('阿宝');
    expect(b.get().checkIns).toHaveLength(1);
  });

  it('清空后已经重新开始了,再恢复:新旧记录合并,资料以现在的为准', async () => {
    const { device } = setup();
    const a = device();
    onboard(a, 'gold-ingot', '旧');
    a.get().checkIn('2026-10-06');
    await a.engine.syncNow();
    a.engine.clearAll();
    await a.engine.syncNow();
    await sleep(5);
    onboard(a, 'wood-bamboo', '新');
    a.get().checkIn('2026-10-07');
    await a.engine.syncNow();

    expect((await a.engine.undoClear()).ok).toBe(true);
    expect(a.get().profile?.nickname).toBe('新');
    expect(a.get().checkIns.map((c) => c.date).sort()).toEqual(['2026-10-06', '2026-10-07']);
    expect(a.get().progress.map((p) => p.characterId).sort()).toEqual(['gold-ingot', 'wood-bamboo']);
  });

  it('没清空过:提示没有可恢复的数据', async () => {
    const { device } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    const r = await a.engine.undoClear();
    expect(r).toEqual({ ok: false, error: '没有可以恢复的数据' });
  });

  it('超过 30 天:提示数据已被永久清除', async () => {
    const { device, ctl } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    a.engine.clearAll();
    await a.engine.syncNow();
    ctl.clock += 31 * 86_400_000;
    expect(await a.engine.undoClear()).toEqual({ ok: false, error: '已经超过 30 天,数据已被永久清除' });
  });

  it('离线时恢复:提示联网,不改任何东西', async () => {
    const { device, ctl } = setup();
    const a = device();
    onboard(a);
    await a.engine.syncNow();
    a.engine.clearAll();
    await a.engine.syncNow();
    ctl.offline = true;
    expect(await a.engine.undoClear()).toEqual({ ok: false, error: '现在连不上服务器,请联网后再试' });
    expect(a.engine.status.getState().clearedAt).not.toBeNull();
  });
});

describe('检查云端数据', () => {
  it('报告云端真实的记录数;空存档码和离线分别给出提示;不改动本地', async () => {
    const { device, ctl } = setup();
    const a = device();
    onboard(a);
    a.get().checkIn('2026-10-06');
    a.get().checkIn('2026-10-07');
    expect(await a.engine.verifyCloud()).toEqual({ ok: true, checkIns: 0, characters: 0, nickname: null }); // 还没同步,云端是空的

    await a.engine.syncNow();
    expect(await a.engine.verifyCloud()).toEqual({ ok: true, checkIns: 2, characters: 1, nickname: '阿宝' });
    expect(a.get().checkIns).toHaveLength(2);

    ctl.offline = true;
    expect(await a.engine.verifyCloud()).toEqual({ ok: false, error: '现在连不上服务器,请联网后再试' });
  });
});
