import { useAppStore } from '../../hooks/useAppStore';
import { useSyncStatus } from '../../services/sync';

/** 签满 3 天后,轻轻提醒一次保存存档码(没有账号,存档码丢了就找不回数据) */
export function CodeReminder({ onGo }: { onGo: () => void }) {
  const status = useSyncStatus();
  const days = useAppStore((s) => new Set(s.checkIns.filter((c) => c.counted).map((c) => c.date)).size);
  if (!status || status.codeAcknowledged || days < 3) return null;
  return (
    <button onClick={onGo} className="w-full rounded-xl bg-gold/30 p-3 text-left text-sm">
      记得保存你的<b>存档码</b>,换手机或清除浏览器数据后才找得回记录。<span className="font-semibold text-brown"> 去保存 ›</span>
    </button>
  );
}
