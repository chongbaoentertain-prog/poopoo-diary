// 联调检查:对真实的 Supabase 项目走一遍 推送 → 拉取 → 清空(软删除) → 再拉取。
// 用法:先在 SQL Editor 执行 supabase/migrations/0001_sync.sql,再运行  node scripts/check-supabase.mjs
// 会用一个随机的测试存档码,不碰任何真实数据;测试留下的软删除行 30 天后自动清除。
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const url = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const apikey = env.VITE_SUPABASE_ANON_KEY;
if (!url || !apikey) throw new Error('.env.local 里缺少 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');

const key = createHash('sha256').update(`poopoo-diary:v1:CHECK-${randomBytes(6).toString('hex')}`).digest('hex');
const rpc = async (fn, body) => {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn} → HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
};
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` ${extra}`}`); if (!ok) failed++; };

const ci = (id, date, counted = true) => ({ id, date, at: `${date}T08:00:00Z`, characterId: 'gold-ingot', stampId: 'gold-ingot:1:happy', counted });

let snap = await rpc('sync_pull', { p_key: key, p_since: null });
check('空存档拉取', snap.checkIns.length === 0 && snap.profile === null && snap.clearedAt === null);

await rpc('sync_push', { p_key: key, p_payload: {
  profile: { nickname: '联调', avatarId: 'gold-ingot', anonymous: false, activeCharacterId: 'gold-ingot', updatedAt: 100 },
  checkIns: [ci('a', '2026-10-01'), ci('b', '2026-10-02')],
  progress: [{ characterId: 'gold-ingot', graduated: false }],
} });
snap = await rpc('sync_pull', { p_key: key, p_since: null });
check('推送后能拉到 2 条签到、1 个角色、资料', snap.checkIns.length === 2 && snap.progress.length === 1 && snap.profile?.nickname === '联调' && snap.profile.updatedAt === 100);

await rpc('sync_push', { p_key: key, p_payload: { profile: { nickname: '旧资料', avatarId: 'gold-ingot', activeCharacterId: 'gold-ingot', updatedAt: 50 }, checkIns: [ci('a', '2026-10-09')], progress: [{ characterId: 'gold-ingot', graduated: true }] } });
snap = await rpc('sync_pull', { p_key: key, p_since: null });
check('较旧的资料不会覆盖新的', snap.profile.nickname === '联调');
check('同 id 的签到记录不会被改动', snap.checkIns.find((c) => c.id === 'a').date === '2026-10-01');
check('毕业状态 false → true', snap.progress[0].graduated === true);

const t0 = snap.serverTime;
await rpc('sync_push', { p_key: key, p_payload: { checkIns: [ci('c', '2026-10-03')], progress: [] } });
const inc = await rpc('sync_pull', { p_key: key, p_since: t0 });
check('增量拉取只含之后变动的', inc.checkIns.length === 1 && inc.checkIns[0].id === 'c');

await rpc('vault_clear', { p_key: key });
snap = await rpc('sync_pull', { p_key: key, p_since: null });
check('清空后全量拉取为空,并带有 clearedAt', snap.checkIns.length === 0 && snap.progress.length === 0 && snap.profile === null && !!snap.clearedAt);
const tomb = await rpc('sync_pull', { p_key: key, p_since: t0 });
check('增量拉取能看到软删除标记(行还在)', tomb.checkIns.length === 3 && tomb.checkIns.every((c) => c.deleted));

await rpc('sync_push', { p_key: key, p_payload: { checkIns: [ci('a', '2026-10-01')], progress: [] } });
snap = await rpc('sync_pull', { p_key: key, p_since: null });
check('旧设备推送已被清空的记录不会让它复活', snap.checkIns.length === 0);

// 撤销清空:清空前再推一次资料和数据,清空 → 恢复,数据和资料应原样回来
await rpc('sync_push', { p_key: key, p_payload: {
  profile: { nickname: '恢复测试', avatarId: 'gold-ingot', activeCharacterId: 'gold-ingot', updatedAt: 200 },
  checkIns: [ci('r1', '2026-11-01'), ci('r2', '2026-11-02')], progress: [{ characterId: 'gold-ingot', graduated: false }],
} });
await rpc('vault_clear', { p_key: key });
await rpc('sync_push', { p_key: key, p_payload: { checkIns: [ci('n1', '2026-11-05')], progress: [] } }); // 清空后又产生的新数据
await rpc('vault_restore', { p_key: key });
snap = await rpc('sync_pull', { p_key: key, p_since: null });
check('恢复后:清空前的 2 条 + 清空后新增的 1 条都在', snap.checkIns.map((c) => c.id).sort().join() === 'n1,r1,r2', JSON.stringify(snap.checkIns.map((c) => c.id)));
check('恢复后:资料回来了,角色回来了,clearedAt 清空', snap.profile?.nickname === '恢复测试' && snap.progress.length === 1 && snap.clearedAt === null);
let noRestore = false;
try { await rpc('vault_restore', { p_key: key }); } catch (e) { noRestore = String(e).includes('nothing to restore'); }
check('没有可恢复的清空时,恢复被拒绝', noRestore);

let blocked = false;
try { await rpc('sync_pull', { p_key: 'not-a-key', p_since: null }); } catch { blocked = true; }
check('格式不对的 key 被拒绝', blocked);

const direct = await fetch(`${url}/rest/v1/vault_check_ins?select=*`, { headers: { apikey } });
const body = direct.ok ? await direct.json() : null;
check('不能绕过函数直接读表', !direct.ok || (Array.isArray(body) && body.length === 0), `HTTP ${direct.status}`);

console.log(failed ? `\n${failed} 项失败` : '\n全部通过');
process.exit(failed ? 1 : 0);
