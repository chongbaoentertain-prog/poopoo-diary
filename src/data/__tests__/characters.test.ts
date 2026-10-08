import { describe, expect, it } from 'vitest';
import { KITS } from '../../components/art/kits';
import { CHARACTERS } from '../characters';

describe('角色表', () => {
  it('id 不重复,名字以「噗」结尾', () => {
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(CHARACTERS.length);
    for (const c of CHARACTERS) expect(c.name.endsWith('噗')).toBe(true);
  });
  it('每个系列 3 只', () => {
    const count = new Map<string, number>();
    for (const c of CHARACTERS) count.set(c.series, (count.get(c.series) ?? 0) + 1);
    expect([...count.values()].every((n) => n === 3)).toBe(true);
  });
  it('每只都有专属道具和场景,且没有多余的美术条目', () => {
    for (const c of CHARACTERS) expect(KITS[c.id], c.id).toBeDefined();
    expect(Object.keys(KITS).sort()).toEqual(CHARACTERS.map((c) => c.id).sort());
  });
});
