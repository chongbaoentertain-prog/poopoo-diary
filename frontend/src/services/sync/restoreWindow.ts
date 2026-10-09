/** 清空后多少天内可以恢复,要和 backend/supabase/migrations 里的 30 天保持一致 */
export const RESTORE_WINDOW_DAYS = 30;

const MILLISECONDS_PER_DAY = 86_400_000;

/** 距离恢复期结束还剩几天;没有清空过或已过期返回 null */
export function getRestoreDaysLeft(clearedAt: string | null, now = Date.now()): number | null {
  if (!clearedAt) return null;
  const daysLeft = RESTORE_WINDOW_DAYS - (now - Date.parse(clearedAt)) / MILLISECONDS_PER_DAY;
  return daysLeft > 0 ? Math.ceil(daysLeft) : null;
}
