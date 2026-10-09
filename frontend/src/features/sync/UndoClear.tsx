import { useState } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { syncEngine } from '../../services/sync';
import { getRestoreDaysLeft } from '../../services/sync/restoreWindow';

/** 清空之后 30 天内,提供「恢复清空的数据」。个人页和新手引导页(清空后会回到这里)共用 */
export function UndoClear() {
  const syncStatus = useSyncStatus();
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const daysLeft = getRestoreDaysLeft(syncStatus?.clearedAt ?? null);
  if (!syncEngine || !syncStatus?.clearedAt || daysLeft === null) return null;

  const handleRestoreClick = async () => {
    setIsBusy(true);
    setErrorMessage('');
    const result = await syncEngine!.undoClearAllData();
    setIsBusy(false);
    if (!result.ok) setErrorMessage(result.error);
  };
  const clearedDate = new Date(syncStatus.clearedAt);

  return (
    <div className="space-y-2 rounded-xl bg-gold/25 p-3 text-sm">
      <p>你在 {clearedDate.getMonth() + 1} 月 {clearedDate.getDate()} 日清空过数据,还有 <b>{daysLeft}</b> 天可以恢复。恢复后会和现在的记录合并。</p>
      <button onClick={handleRestoreClick} disabled={isBusy} className="w-full rounded-lg bg-brown p-2 font-semibold text-porcelain disabled:opacity-40">
        {isBusy ? '恢复中…' : '恢复清空的数据'}
      </button>
      {errorMessage && <p role="alert" className="text-xs text-red-700">{errorMessage}</p>}
    </div>
  );
}
