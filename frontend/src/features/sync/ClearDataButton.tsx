import { useState } from 'react';
import { syncEngine } from '../../services/sync';
import { appStore } from '../../stores/appStore';

const CONFIRMATION_WORD = '清空';

/** 清空全部数据。要输入「清空」才能确认;云端是软删除,保留 30 天后才彻底清除 */
export function ClearDataButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const closeDialog = () => { setIsDialogOpen(false); setTypedText(''); };

  const handleConfirmClick = () => {
    if (syncEngine) syncEngine.clearAllData(); else appStore.getState().resetAllData();
    closeDialog();
  };

  return (
    <>
      <div className="flex justify-center pt-2">
        <button onClick={() => setIsDialogOpen(true)} className="rounded-xl border-2 border-brown bg-gold/40 px-6 py-2 font-semibold text-brown">清空全部数据</button>
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" role="alertdialog" aria-modal="true" aria-label="清空全部数据" onClick={closeDialog}>
          <div className="w-full max-w-sm space-y-3 rounded-2xl bg-tile p-5" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-semibold">确定要清空全部数据吗?</h2>
            <p className="text-sm leading-relaxed">
              所有签到记录、角色和图鉴都会被清除,回到最开始的样子。
              {syncEngine && '云端的记录也会被清除,其他设备下次同步时同样会被清空。30 天内可以恢复,超过 30 天就彻底没有了。'}
            </p>
            <label className="block space-y-1 text-sm">
              <span>请输入「{CONFIRMATION_WORD}」确认</span>
              <input value={typedText} onChange={(event) => setTypedText(event.target.value)} autoFocus className="w-full rounded-lg border border-grout bg-porcelain p-2" />
            </label>
            <div className="flex gap-2">
              <button onClick={closeDialog} className="flex-1 rounded-xl bg-porcelain p-2">取消</button>
              <button onClick={handleConfirmClick} disabled={typedText.trim() !== CONFIRMATION_WORD} className="flex-1 rounded-xl bg-brown p-2 font-semibold text-porcelain disabled:opacity-40">确认清空</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
