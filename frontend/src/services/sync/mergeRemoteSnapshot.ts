import { CHARACTERS } from '../../data/characters';
import { newProgress } from '../../domain/evolution';
import type { CheckIn } from '../../types/diary';
import { EMPTY_STATE, type AppState } from '../storage/AppStateRepository';
import { normalizeState } from '../../stores/normalizeAppState';
import type { RemoteSnapshot } from './syncTypes';

/**
 * 把云端数据并进本地。纯函数,不碰网络和存储。
 *
 * - wipe:别的设备清空过全部数据,先清掉本地再合并。
 * - 签到记录只增不改、id 唯一,所以直接按 id 取并集;被软删除的删掉本地同 id 的。
 * - 角色进度取并集,毕业状态只会 false → true。**不处理进度的删除标记**:进度只会因「清空」被删,
 *   而清空已经由 wipe 处理;若再按标记删,用户清空后马上重选同一只角色会被误删。
 * - 个人资料(昵称、头像、当前培育的角色)后写者胜。
 */
export function applyRemote(local: AppState, remote: RemoteSnapshot, wipe: boolean): AppState {
  const base = wipe ? EMPTY_STATE : local;
  const known = new Set(CHARACTERS.map((c) => c.id));

  const checkIns = new Map<string, CheckIn>(base.checkIns.map((c) => [c.id, c]));
  for (const r of remote.checkIns) {
    if (r.deleted) { checkIns.delete(r.id); continue; }
    if (!checkIns.has(r.id)) {
      // 经验/连续天数/倍率是派生数据,normalizeState 会重算
      checkIns.set(r.id, { id: r.id, date: r.date, at: r.at, characterId: r.characterId, stampId: r.stampId, counted: r.counted, xpGained: 0, streak: 0, multiplier: 1 });
    }
  }

  const progress = new Map(base.progress.map((p) => [p.characterId, p]));
  for (const r of remote.progress) {
    if (r.deleted || !known.has(r.characterId)) continue;
    const mine = progress.get(r.characterId) ?? newProgress(r.characterId);
    progress.set(r.characterId, { ...mine, graduated: mine.graduated || r.graduated });
  }

  let { profile, activeCharacterId, profileUpdatedAt } = base;
  const rp = remote.profile;
  if (rp && (!profile || rp.updatedAt > (profileUpdatedAt ?? 0))) {
    profile = { nickname: rp.nickname, avatarId: rp.avatarId, anonymous: rp.anonymous };
    activeCharacterId = rp.activeCharacterId;
    profileUpdatedAt = rp.updatedAt;
  }

  return normalizeState({ ...base, profile, activeCharacterId, profileUpdatedAt, checkIns: [...checkIns.values()], progress: [...progress.values()] });
}
