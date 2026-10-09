import { addDays } from './date';
import { stageForXp } from './evolution';
import { MAX_STAGE } from './rules';
import type { CharacterProgress, CheckIn } from '../types/diary';
import { multiplierForStreak, xpForStreak } from './xp';

/**
 * 按"全部打卡记录"重算连续天数 / 倍率 / 经验 / 形态。
 * 补卡、乱序补卡、跨月都靠它保证结果与打卡顺序无关。
 */
export function recomputeAll(checkIns: readonly CheckIn[], progress: readonly CharacterProgress[]) {
  const counted = checkIns.filter((c) => c.counted).sort((a, b) => a.date.localeCompare(b.date));
  const byId = new Map<string, { streak: number; multiplier: number; xp: number }>();
  let prev = '';
  let streak = 0;
  for (const c of counted) {
    if (c.date !== prev) streak = prev && addDays(c.date, -1) === prev ? streak + 1 : 1;
    prev = c.date;
    byId.set(c.id, { streak, multiplier: multiplierForStreak(streak), xp: xpForStreak(streak) });
  }
  const next = checkIns.map((c) => {
    const r = byId.get(c.id);
    return r ? { ...c, streak: r.streak, multiplier: r.multiplier, xpGained: r.xp } : c;
  });
  const xpBy = new Map<string, number>();
  for (const c of next) if (c.counted) xpBy.set(c.characterId, (xpBy.get(c.characterId) ?? 0) + c.xpGained);
  const prog = progress.map((p) => {
    const xp = xpBy.get(p.characterId) ?? 0;
    const stage = stageForXp(xp);
    return { ...p, xp, stage, maxed: stage >= MAX_STAGE };
  });
  return { checkIns: next, progress: prog };
}
