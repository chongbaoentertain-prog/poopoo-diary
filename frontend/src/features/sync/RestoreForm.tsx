import { useState } from 'react';
import { syncEngine } from '../../services/sync';

/** 输入存档码,把另一台设备的数据恢复过来。个人页和新手引导页共用 */
export function RestoreForm({ onDone }: { onDone?: () => void }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!syncEngine) return null;

  const run = async () => {
    setBusy(true);
    setError('');
    const r = await syncEngine!.restore(input);
    setBusy(false);
    if (r.ok) { setInput(''); onDone?.(); } else setError(r.error);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" aria-label="存档码"
          autoCapitalize="characters" autoCorrect="off" spellCheck={false}
          className="min-w-0 flex-1 rounded-lg border border-grout bg-porcelain p-2 font-mono text-sm" />
        <button onClick={run} disabled={busy || !input.trim()} className="rounded-lg bg-brown px-4 py-2 text-sm font-semibold text-porcelain disabled:opacity-40">
          {busy ? '恢复中…' : '恢复'}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
