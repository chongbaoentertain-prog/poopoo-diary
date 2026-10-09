import { useState } from 'react';
import { syncEngine, useSyncStatus } from '../../services/sync';
import { restoreDaysLeft } from '../../services/sync/restoreWindow';

/** 清空之后 30 天内,提供「恢复清空的数据」。个人页和新手引导页(清空后会回到这里)共用 */
export function UndoClear() {
  const status = useSyncStatus();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const left = restoreDaysLeft(status?.clearedAt ?? null);
  if (!syncEngine || !status?.clearedAt || left === null) return null;

  const run = async () => {
    setBusy(true);
    setError('');
    const r = await syncEngine!.undoClear();
    setBusy(false);
    if (!r.ok) setError(r.error);
  };
  const d = new Date(status.clearedAt);

  return (
    <div className="space-y-2 rounded-xl bg-gold/25 p-3 text-sm">
      <p>你在 {d.getMonth() + 1} 月 {d.getDate()} 日清空过数据,还有 <b>{left}</b> 天可以恢复。恢复后会和现在的记录合并。</p>
      <button onClick={run} disabled={busy} className="w-full rounded-lg bg-brown p-2 font-semibold text-porcelain disabled:opacity-40">
        {busy ? '恢复中…' : '恢复清空的数据'}
      </button>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
