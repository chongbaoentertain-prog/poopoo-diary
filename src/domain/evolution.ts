import { MAX_STAGE, STAGE_THRESHOLDS } from './rules';
import type { CharacterProgress } from './types';

export function stageForXp(xp: number): number {
  let stage = 1;
  STAGE_THRESHOLDS.forEach((t, i) => {
    if (xp >= t) stage = i + 1;
  });
  return stage;
}

/** 当前形态内的进度 0..1;最高形态恒为 1 */
export function progressToNext(xp: number): number {
  const stage = stageForXp(xp);
  if (stage >= MAX_STAGE) return 1;
  const lo = STAGE_THRESHOLDS[stage - 1];
  const hi = STAGE_THRESHOLDS[stage];
  return (xp - lo) / (hi - lo);
}

export function newProgress(characterId: string): CharacterProgress {
  return { characterId, xp: 0, stage: 1, maxed: false, graduated: false };
}

/** 加经验并判断是否进化。已毕业的角色不再加经验;满级后可继续累积。 */
export function applyXp(
  p: CharacterProgress,
  gain: number,
): { progress: CharacterProgress; evolved: boolean; reachedMax: boolean } {
  if (p.graduated || gain <= 0) return { progress: p, evolved: false, reachedMax: false };
  const xp = p.xp + gain;
  const stage = stageForXp(xp);
  const maxed = stage >= MAX_STAGE;
  return {
    progress: { ...p, xp, stage, maxed },
    evolved: stage > p.stage,
    reachedMax: maxed && !p.maxed,
  };
}

/** 满级后"换新角色":当前角色毕业入图鉴(保留最终形态与经验) */
export function graduate(p: CharacterProgress): CharacterProgress {
  if (!p.maxed) throw new Error('只有达到最高形态才能毕业');
  return { ...p, graduated: true };
}
