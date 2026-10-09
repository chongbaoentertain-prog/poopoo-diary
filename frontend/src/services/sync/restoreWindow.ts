/** 清空后多少天内可以恢复,要和 supabase/migrations 里的 30 天保持一致 */
export const RESTORE_DAYS = 30;

/** 距离恢复期结束还剩几天;没有清空过或已过期返回 null */
export function restoreDaysLeft(clearedAt: string | null, now = Date.now()): number | null {
  if (!clearedAt) return null;
  const left = RESTORE_DAYS - (now - Date.parse(clearedAt)) / 86_400_000;
  return left > 0 ? Math.ceil(left) : null;
}
