import { CHARACTERS } from '../data/characters';
import { recomputeAll } from '../domain/recomputeFromCheckIns';
import { EMPTY_STATE, type AppState } from '../services/storage/AppStateRepository';

/**
 * 读档、合并云端数据之后统一做的修正,保证状态自洽:
 * 1. 丢掉已下架角色(beta 期间角色表缩减过);一只有效角色都不剩就回到初始状态,让用户重新选角。
 * 2. 当前角色 / 头像指向不存在的角色时,换成剩下的第一只。
 * 3. 同一天只能有一条"计经验"的记录(两台设备各自签到时会冲突),保留最早的。
 * 4. 重算连续天数、倍率、经验、形态。
 */
export function normalizeState(s: AppState): AppState {
  const known = new Set(CHARACTERS.map((c) => c.id));
  const progress = s.progress.filter((p) => known.has(p.characterId));
  if (s.profile && progress.length === 0) return EMPTY_STATE;

  const active = progress.find((p) => p.characterId === s.activeCharacterId) ?? progress.find((p) => !p.graduated) ?? progress[0];
  const profile = s.profile && !known.has(s.profile.avatarId) && active ? { ...s.profile, avatarId: active.characterId } : s.profile;

  const seen = new Set<string>();
  const checkIns = [...s.checkIns].sort((a, b) => a.at.localeCompare(b.at)).map((c) => {
    if (!c.counted) return c;
    if (seen.has(c.date)) return { ...c, counted: false };
    seen.add(c.date);
    return c;
  });

  const r = recomputeAll(checkIns, progress);
  return { ...s, profile, activeCharacterId: active?.characterId ?? null, checkIns: r.checkIns, progress: r.progress };
}
