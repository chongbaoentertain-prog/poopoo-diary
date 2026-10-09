import { useAppStore } from '../../hooks/useAppStore';
import { useSyncStatus } from '../../hooks/useSyncStatus';

const MIN_CHECKED_IN_DAYS_TO_REMIND = 3;

/** 签满 3 天后,轻轻提醒一次保存存档码(没有账号,存档码丢了就找不回数据) */
export function CodeReminder({ onGoToProfile }: { onGoToProfile: () => void }) {
  const syncStatus = useSyncStatus();
  const checkedInDayCount = useAppStore((state) => new Set(state.checkIns.filter((checkIn) => checkIn.counted).map((checkIn) => checkIn.date)).size);
  if (!syncStatus || syncStatus.hasAcknowledgedSaveCode || checkedInDayCount < MIN_CHECKED_IN_DAYS_TO_REMIND) return null;
  return (
    <button onClick={onGoToProfile} className="w-full rounded-xl bg-gold/30 p-3 text-left text-sm">
      记得保存你的<b>存档码</b>,换手机或清除浏览器数据后才找得回记录。<span className="font-semibold text-brown"> 去保存 ›</span>
    </button>
  );
}
