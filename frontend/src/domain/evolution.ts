import type { CharacterId, CharacterProgress } from '../types/diary';
import { MAX_STAGE, STAGE_THRESHOLDS } from './rules';

export function stageForXp(xp: number): number {
  let stage = 1;
  STAGE_THRESHOLDS.forEach((requiredXp, index) => {
    if (xp >= requiredXp) stage = index + 1;
  });
  return stage;
}

/** 当前形态内的进度 0..1;最高形态恒为 1 */
export function progressToNextStage(xp: number): number {
  const stage = stageForXp(xp);
  if (stage >= MAX_STAGE) return 1;
  const currentStageStartXp = STAGE_THRESHOLDS[stage - 1];
  const nextStageStartXp = STAGE_THRESHOLDS[stage];
  return (xp - currentStageStartXp) / (nextStageStartXp - currentStageStartXp);
}

export function createInitialProgress(characterId: CharacterId): CharacterProgress {
  return { characterId, xp: 0, stage: 1, maxed: false, graduated: false };
}

export interface ApplyXpResult {
  progress: CharacterProgress;
  evolved: boolean;
  reachedMax: boolean;
}

/** 加经验并判断是否进化。已毕业的角色不再加经验;满级后可继续累积。 */
export function applyXp(progress: CharacterProgress, xpGained: number): ApplyXpResult {
  if (progress.graduated || xpGained <= 0) return { progress, evolved: false, reachedMax: false };
  const xp = progress.xp + xpGained;
  const stage = stageForXp(xp);
  const maxed = stage >= MAX_STAGE;
  return {
    progress: { ...progress, xp, stage, maxed },
    evolved: stage > progress.stage,
    reachedMax: maxed && !progress.maxed,
  };
}

/** 满级后"换新角色":当前角色毕业入图鉴(保留最终形态与经验) */
export function graduate(progress: CharacterProgress): CharacterProgress {
  if (!progress.maxed) throw new Error('只有达到最高形态才能毕业');
  return { ...progress, graduated: true };
}
