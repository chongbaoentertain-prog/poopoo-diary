import { useState } from 'react';
import { syncEngine } from '../../services/sync';

/** 输入存档码,把另一台设备的数据恢复过来。个人页和新手引导页共用 */
export function RestoreForm({ onRestored }: { onRestored?: () => void }) {
  const [saveCodeInput, setSaveCodeInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  if (!syncEngine) return null;

  const handleRestoreClick = async () => {
    setIsBusy(true);
    setErrorMessage('');
    const result = await syncEngine!.restoreFromSaveCode(saveCodeInput);
    setIsBusy(false);
    if (result.ok) {
      setSaveCodeInput('');
      onRestored?.();
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={saveCodeInput} onChange={(event) => setSaveCodeInput(event.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" aria-label="存档码"
          autoCapitalize="characters" autoCorrect="off" spellCheck={false}
          className="min-w-0 flex-1 rounded-lg border border-grout bg-porcelain p-2 font-mono text-sm" />
        <button onClick={handleRestoreClick} disabled={isBusy || !saveCodeInput.trim()} className="rounded-lg bg-brown px-4 py-2 text-sm font-semibold text-porcelain disabled:opacity-40">
          {isBusy ? '恢复中…' : '恢复'}
        </button>
      </div>
      {errorMessage && <p role="alert" className="text-xs text-red-700">{errorMessage}</p>}
    </div>
  );
}
