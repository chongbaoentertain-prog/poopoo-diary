import { useState } from 'react';
import { appStore } from '../../hooks/useAppStore';
import { syncEngine } from '../../services/sync';

const CONFIRM_WORD = '清空';

/** 清空全部数据。要输入「清空」才能确认;云端是软删除,保留 30 天后才彻底清除 */
export function ClearDataButton() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const close = () => { setOpen(false); setTyped(''); };

  const confirm = () => {
    if (syncEngine) syncEngine.clearAll(); else appStore.getState().resetAll();
    close();
  };

  return (
    <>
      <div className="flex justify-center pt-2">
        <button onClick={() => setOpen(true)} className="rounded-xl border-2 border-brown bg-gold/40 px-6 py-2 font-semibold text-brown">清空全部数据</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" role="alertdialog" aria-modal="true" aria-label="清空全部数据" onClick={close}>
          <div className="w-full max-w-sm space-y-3 rounded-2xl bg-tile p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold">确定要清空全部数据吗?</h2>
            <p className="text-sm leading-relaxed">
              所有签到记录、角色和图鉴都会被清除,回到最开始的样子。
              {syncEngine && '云端的记录也会被清除,其他设备下次同步时同样会被清空。30 天内可以恢复,超过 30 天就彻底没有了。'}
            </p>
            <label className="block space-y-1 text-sm">
              <span>请输入「{CONFIRM_WORD}」确认</span>
              <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus className="w-full rounded-lg border border-grout bg-porcelain p-2" />
            </label>
            <div className="flex gap-2">
              <button onClick={close} className="flex-1 rounded-xl bg-porcelain p-2">取消</button>
              <button onClick={confirm} disabled={typed.trim() !== CONFIRM_WORD} className="flex-1 rounded-xl bg-brown p-2 font-semibold text-porcelain disabled:opacity-40">确认清空</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
