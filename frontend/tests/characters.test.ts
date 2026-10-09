import { describe, expect, it } from 'vitest';
import { CHARACTER_KITS } from '../src/components/poo/characterKits';
import { CHARACTERS } from '../src/data/characters';

describe('角色表', () => {
  it('id 不重复,名字以「噗」结尾', () => {
    expect(new Set(CHARACTERS.map((character) => character.id)).size).toBe(CHARACTERS.length);
    for (const character of CHARACTERS) expect(character.name.endsWith('噗')).toBe(true);
  });
  it('每个系列 3 只', () => {
    const characterCountBySeries = new Map<string, number>();
    for (const character of CHARACTERS) {
      characterCountBySeries.set(character.seriesId, (characterCountBySeries.get(character.seriesId) ?? 0) + 1);
    }
    expect([...characterCountBySeries.values()].every((count) => count === 3)).toBe(true);
  });
  it('每只都有专属道具和场景,且没有多余的美术条目', () => {
    for (const character of CHARACTERS) expect(CHARACTER_KITS[character.id], character.id).toBeDefined();
    expect(Object.keys(CHARACTER_KITS).sort()).toEqual(CHARACTERS.map((character) => character.id).sort());
  });
});

describe('分享文案', () => {
  it('每只角色至少 3 句,且不重复', () => {
    for (const character of CHARACTERS) {
      expect(character.quotes.length, character.id).toBeGreaterThanOrEqual(3);
      expect(new Set(character.quotes).size, character.id).toBe(character.quotes.length);
    }
  });
});
