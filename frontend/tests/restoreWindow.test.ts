import { describe, expect, it } from 'vitest';
import { getRestoreDaysLeft } from '../src/services/sync/restoreWindow';

describe('恢复期', () => {
  const clearedAtMs = Date.parse('2026-10-01T00:00:00Z');
  const clearedAt = '2026-10-01T00:00:00Z';
  const afterDays = (days: number) => clearedAtMs + days * 86_400_000;

  it('没清空过 / 已过期 返回 null,期内返回剩余天数(向上取整)', () => {
    expect(getRestoreDaysLeft(null, clearedAtMs)).toBeNull();
    expect(getRestoreDaysLeft(clearedAt, clearedAtMs)).toBe(30);
    expect(getRestoreDaysLeft(clearedAt, afterDays(29.5))).toBe(1);
    expect(getRestoreDaysLeft(clearedAt, afterDays(30))).toBeNull();
  });
});
