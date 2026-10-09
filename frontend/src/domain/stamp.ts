import type { Mood } from '../types/character';
import type { CharacterId } from '../types/diary';

/**
 * 印章 = 一次签到当时的样子:哪只角色、什么形态、什么心情。
 * 存在每条签到记录的 stampId 里,格式 `角色id:形态:心情`,例如 `weak-worker:3:breakdown`。
 * 所有读写都走这里,别处不要手动 split(':')。
 */
export interface Stamp {
  characterId: CharacterId;
  stage: number;
  mood: Mood;
}

/**
 * 心情内部名字改过一次。改名之前签的记录(本机存档和云端数据库里)存的还是旧名字,
 * 永远读得到,所以读取时统一转成新名字。写入一律用新名字。
 */
const LEGACY_MOOD_IDS: Record<string, Mood> = {
  happy: 'refreshed',
  think: 'calm',
  sleep: 'lyingFlat',
  speechless: 'sulky',
  sad: 'deflated',
  nausea: 'disgusted',
  dizzy: 'breakdown',
};

export const formatStampId = ({ characterId, stage, mood }: Stamp): string => `${characterId}:${stage}:${mood}`;

export function parseStampId(stampId: string): Stamp {
  const [characterId, stageText, moodText] = stampId.split(':');
  return { characterId, stage: Number(stageText), mood: LEGACY_MOOD_IDS[moodText] ?? (moodText as Mood) };
}
