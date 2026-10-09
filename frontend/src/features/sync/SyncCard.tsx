import { useEffect, useState } from 'react';
import { syncEngine, useSyncStatus } from '../../services/sync';
import { useAppStore } from '../../hooks/useAppStore';
import { RestoreForm } from './RestoreForm';
import { UndoClear } from './UndoClear';

const ago = (t: number) => {
  const m = Math.floor((Date.now() - t) / 60_000);
  return m < 1 ? '刚刚' : m < 60 ? `${m} 分钟前` : `${Math.floor(m / 60)} 小时前`;
};

/** 存档码与同步状态。没配置后端时整张卡片不出现 */
export function SyncCard() {
  const status = useSyncStatus();
  const hasData = useAppStore((s) => s.checkIns.length > 0);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [check, setCheck] = useState<string | null>(null);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30_000); return () => clearInterval(t); }, []);
  if (!syncEngine || !status) return null;

  const label = status.state === 'syncing' ? '同步中…'
    : status.state === 'offline' ? '离线,联网后自动同步'
    : status.state === 'error' ? '同步失败,稍后会自动重试'
    : status.lastSyncAt ? `已同步 · ${ago(status.lastSyncAt)}` : '等待同步';
  const dot = status.state === 'idle' ? 'bg-green-600' : status.state === 'syncing' ? 'bg-gold' : 'bg-neutral-400';

  const copy = async () => {
    try { await navigator.clipboard.writeText(status.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setShown(true); }
    syncEngine!.acknowledgeCode();
  };

  const verify = async () => {
    setCheck('检查中…');
    const r = await syncEngine!.verifyCloud();
    setCheck(!r.ok ? r.error : r.checkIns + r.characters === 0 ? '云端还没有这个存档码的数据。先签一次到,等状态变成「已同步」再检查。'
      : `云端已保存 ${r.checkIns} 条签到记录、${r.characters} 只角色${r.nickname ? `,昵称「${r.nickname}」` : ''}。存档码有效 ✓`);
  };

  return (
    <div className="space-y-3 rounded-2xl bg-porcelain p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">存档与同步</div>
        <button onClick={() => void syncEngine!.syncNow()} className="flex items-center gap-1.5 text-xs" aria-label="立即同步">
          <span className={`h-2 w-2 rounded-full ${dot}`} />{label}
        </button>
      </div>
      {status.state === 'error' && status.error && <p className="break-all text-[11px] opacity-60">{status.error}</p>}
      <UndoClear />

      <div className="space-y-1">
        <div className="text-xs">我的存档码</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-tile px-3 py-2 text-center font-mono text-sm tracking-wider">
            {shown ? status.code : '••••-••••-••••-••••'}
          </code>
          <button onClick={() => { setShown(!shown); if (!shown) syncEngine!.acknowledgeCode(); }} className="rounded-lg bg-tile px-3 py-2 text-xs">{shown ? '隐藏' : '显示'}</button>
          <button onClick={copy} className="rounded-lg bg-brown px-3 py-2 text-xs font-semibold text-porcelain">{copied ? '已复制' : '复制'}</button>
        </div>
        <p className="text-[11px] leading-relaxed opacity-70">
          换设备或清除浏览器数据后,靠它找回记录。请截图或抄下来收好;拿到存档码的人能看到你的记录,不要发给别人。
        </p>
        <button onClick={verify} className="text-xs underline">检查云端数据</button>
        {check && <p role="status" className="text-xs">{check}</p>}
      </div>

      <div className="space-y-2 border-t border-grout pt-3">
        <button onClick={() => setRestoring(!restoring)} aria-expanded={restoring} className="text-sm">在这台设备恢复另一个存档 {restoring ? '▾' : '▸'}</button>
        {restoring && (
          <>
            {hasData && <p className="text-[11px] opacity-70">这台设备上已有记录,恢复后会和那个存档里的记录合并,不会丢。</p>}
            <RestoreForm onDone={() => setRestoring(false)} />
          </>
        )}
      </div>
    </div>
  );
}
