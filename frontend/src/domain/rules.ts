// 所有数值集中在这里,调平衡只改此文件
export const BASE_XP = 10;
export const STREAK_BONUS_PER_DAY = 0.1; // 连续每多 1 天 +10%
export const STREAK_BONUS_CAP = 1.0; // 最多 +100%(即 2 倍,第 11 天封顶)
// 第 N 形态所需累计经验(下标 0 = 形态 1),越往后越难
export const STAGE_THRESHOLDS = [0, 100, 300, 700, 1500] as const;
export const MAX_STAGE = STAGE_THRESHOLDS.length;
