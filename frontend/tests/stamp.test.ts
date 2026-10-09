import { describe, expect, it } from 'vitest';
import { formatStampId, parseStampId } from '../src/domain/stamp';

describe('印章', () => {
  it('写入再读出,内容不变', () => {
    const stamp = { characterId: 'weak-worker', stage: 4, mood: 'sulky' as const };
    expect(formatStampId(stamp)).toBe('weak-worker:4:sulky');
    expect(parseStampId('weak-worker:4:sulky')).toEqual(stamp);
  });

  it('心情改名前签的记录里的旧名字,读取时转成新名字', () => {
    const legacyToCurrent = {
      happy: 'refreshed', think: 'calm', sleep: 'lyingFlat', speechless: 'sulky',
      sad: 'deflated', nausea: 'disgusted', dizzy: 'breakdown',
    };
    for (const [legacyMood, currentMood] of Object.entries(legacyToCurrent)) {
      expect(parseStampId(`gold-ingot:1:${legacyMood}`).mood, legacyMood).toBe(currentMood);
    }
  });
});
