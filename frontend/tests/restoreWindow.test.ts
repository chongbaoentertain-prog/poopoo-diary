import { describe, expect, it } from 'vitest';
import { restoreDaysLeft } from '../src/services/sync/restoreWindow';

describe('恢复期', () => {
  const t0 = Date.parse('2026-10-01T00:00:00Z');
  it('没清空过 / 已过期 返回 null,期内返回剩余天数(向上取整)', () => {
    expect(restoreDaysLeft(null, t0)).toBeNull();
    expect(restoreDaysLeft('2026-10-01T00:00:00Z', t0)).toBe(30);
    expect(restoreDaysLeft('2026-10-01T00:00:00Z', t0 + 29.5 * 86_400_000)).toBe(1);
    expect(restoreDaysLeft('2026-10-01T00:00:00Z', t0 + 30 * 86_400_000)).toBeNull();
  });
});
