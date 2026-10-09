import { useEffect, useState } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { syncEngine } from '../../services/sync';
import { RestoreForm } from './RestoreForm';
import { UndoClear } from './UndoClear';

const STATUS_LABEL_REFRESH_MS = 30_000;

const formatTimeAgo = (timestamp: number) => {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return '刚刚';
  return minutes < 60 ? `${minutes} 分钟前` : `${Math.floor(minutes / 60)} 小时前`;
};

/** 存档码与同步状态。没配置后端时整张卡片不出现 */
export function SyncCard() {
  const syncStatus = useSyncStatus();
  const hasLocalCheckIns = useAppStore((state) => state.checkIns.length > 0);
  const [isSaveCodeVisible, setIsSaveCodeVisible] = useState(false);
  const [wasCopied, setWasCopied] = useState(false);
  const [isRestoreFormOpen, setIsRestoreFormOpen] = useState(false);
  const [cloudCheckMessage, setCloudCheckMessage] = useState<string | null>(null);
  const [, forceRefresh] = useState(0); // 让"N 分钟前"随时间更新
  useEffect(() => {
    const timer = setInterval(() => forceRefresh((count) => count + 1), STATUS_LABEL_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);
  if (!syncEngine || !syncStatus) return null;

  const statusLabel = syncStatus.state === 'syncing' ? '同步中…'
    : syncStatus.state === 'offline' ? '离线,联网后自动同步'
    : syncStatus.state === 'error' ? '同步失败,稍后会自动重试'
    : syncStatus.lastSyncAt ? `已同步 · ${formatTimeAgo(syncStatus.lastSyncAt)}` : '等待同步';
  const statusDotClass = syncStatus.state === 'idle' ? 'bg-green-600' : syncStatus.state === 'syncing' ? 'bg-gold' : 'bg-neutral-400';

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(syncStatus.saveCode);
      setWasCopied(true);
      setTimeout(() => setWasCopied(false), 1500);
    } catch {
      setIsSaveCodeVisible(true); // 复制失败就直接显示出来,让用户手抄
    }
    syncEngine!.acknowledgeSaveCode();
  };

  const handleToggleVisibilityClick = () => {
    setIsSaveCodeVisible(!isSaveCodeVisible);
    if (!isSaveCodeVisible) syncEngine!.acknowledgeSaveCode();
  };

  const handleVerifyCloudClick = async () => {
    setCloudCheckMessage('检查中…');
    const verification = await syncEngine!.verifyCloud();
    if (!verification.ok) {
      setCloudCheckMessage(verification.error);
    } else if (verification.checkInCount + verification.characterCount === 0) {
      setCloudCheckMessage('云端还没有这个存档码的数据。先签一次到,等状态变成「已同步」再检查。');
    } else {
      const nicknameText = verification.nickname ? `,昵称「${verification.nickname}」` : '';
      setCloudCheckMessage(`云端已保存 ${verification.checkInCount} 条签到记录、${verification.characterCount} 只角色${nicknameText}。存档码有效 ✓`);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-porcelain p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">存档与同步</div>
        <button onClick={() => void syncEngine!.syncNow()} className="flex items-center gap-1.5 text-xs" aria-label="立即同步">
          <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />{statusLabel}
        </button>
      </div>
      {syncStatus.state === 'error' && syncStatus.errorMessage && <p className="break-all text-[11px] opacity-60">{syncStatus.errorMessage}</p>}
      <UndoClear />

      <div className="space-y-1">
        <div className="text-xs">我的存档码</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-tile px-3 py-2 text-center font-mono text-sm tracking-wider">
            {isSaveCodeVisible ? syncStatus.saveCode : '••••-••••-••••-••••'}
          </code>
          <button onClick={handleToggleVisibilityClick} className="rounded-lg bg-tile px-3 py-2 text-xs">{isSaveCodeVisible ? '隐藏' : '显示'}</button>
          <button onClick={handleCopyClick} className="rounded-lg bg-brown px-3 py-2 text-xs font-semibold text-porcelain">{wasCopied ? '已复制' : '复制'}</button>
        </div>
        <p className="text-[11px] leading-relaxed opacity-70">
          换设备或清除浏览器数据后,靠它找回记录。请截图或抄下来收好;拿到存档码的人能看到你的记录,不要发给别人。
        </p>
        <button onClick={handleVerifyCloudClick} className="text-xs underline">检查云端数据</button>
        {cloudCheckMessage && <p role="status" className="text-xs">{cloudCheckMessage}</p>}
      </div>

      <div className="space-y-2 border-t border-grout pt-3">
        <button onClick={() => setIsRestoreFormOpen(!isRestoreFormOpen)} aria-expanded={isRestoreFormOpen} className="text-sm">在这台设备恢复另一个存档 {isRestoreFormOpen ? '▾' : '▸'}</button>
        {isRestoreFormOpen && (
          <>
            {hasLocalCheckIns && <p className="text-[11px] opacity-70">这台设备上已有记录,恢复后会和那个存档里的记录合并,不会丢。</p>}
            <RestoreForm onRestored={() => setIsRestoreFormOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
}
