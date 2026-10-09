import { useMemo, useRef, useState } from 'react';
import { addDays, toDateKey } from '../../domain/date';
import { useAppStore } from '../../hooks/useAppStore';
import type { DateKey } from '../../types/diary';
import { renderSvgToPng, shareOrDownloadImage } from './exportCardAsPng';
import { ShareCard } from './ShareCard';
import { buildShareCardData, getShareDateRange, MAX_SHARE_RANGE_DAYS, type ShareRangeKind } from './shareCardData';

const RANGE_OPTIONS: [ShareRangeKind, string][] = [['day', '当天'], ['week', '近 7 天'], ['month', '本月'], ['custom', '自定义']];
const CHECKBOX_LABEL_CLASS = 'flex items-center gap-2 text-sm';

interface ShareSheetProps {
  selectedDate: DateKey;
  onClose: () => void;
}

/** 分享面板:选范围 → 预览卡片 → 选择隐藏哪些信息 → 分享/下载图片 */
export function ShareSheet({ selectedDate, onClose }: ShareSheetProps) {
  const today = toDateKey(new Date());
  const checkIns = useAppStore((state) => state.checkIns);
  const profile = useAppStore((state) => state.profile);
  const [rangeKind, setRangeKind] = useState<ShareRangeKind>('day');
  const [customRange, setCustomRange] = useState<[DateKey, DateKey]>([addDays(today, -13), today]);
  const [hideNickname, setHideNickname] = useState(false);
  const [hideMood, setHideMood] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const cardSvgRef = useRef<SVGSVGElement>(null);

  const [fromDate, toDate] = getShareDateRange(rangeKind, selectedDate, today, customRange);
  const cardData = useMemo(() => buildShareCardData(checkIns, profile, fromDate, toDate), [checkIns, profile, fromDate, toDate]);

  const handleShareClick = async () => {
    if (!cardSvgRef.current) return;
    setIsBusy(true);
    try {
      const fileName = `poopoo-${fromDate}${fromDate === toDate ? '' : `_${toDate}`}`;
      const outcome = await shareOrDownloadImage(await renderSvgToPng(cardSvgRef.current), fileName);
      setStatusMessage(outcome === 'downloaded' ? '图片已保存,可以发给朋友啦' : outcome === 'shared' ? '已分享' : '');
    } catch {
      setStatusMessage('生成图片失败,请再试一次');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="分享" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-tile p-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">分享我的噗</h2>
          <button onClick={onClose} aria-label="关闭" className="rounded-lg bg-porcelain px-3 py-1">✕</button>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="分享范围">
          {RANGE_OPTIONS.map(([optionKind, label]) => (
            <button key={optionKind} aria-pressed={rangeKind === optionKind} onClick={() => setRangeKind(optionKind)}
              className={`rounded-full px-3 py-1 text-sm ${rangeKind === optionKind ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>
              {optionKind === 'day' && selectedDate !== today ? `${Number(selectedDate.slice(5, 7))}月${Number(selectedDate.slice(8))}日` : label}
            </button>
          ))}
        </div>
        {rangeKind === 'custom' && (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <input type="date" value={customRange[0]} max={today} aria-label="开始日期" className="rounded-lg border border-grout p-1"
                onChange={(event) => event.target.value && setCustomRange([event.target.value, customRange[1]])} />
              <span>至</span>
              <input type="date" value={customRange[1]} max={today} aria-label="结束日期" className="rounded-lg border border-grout p-1"
                onChange={(event) => event.target.value && setCustomRange([customRange[0], event.target.value])} />
            </div>
            <p className="text-xs opacity-70">最多 {MAX_SHARE_RANGE_DAYS} 天,超出的部分会被截掉。</p>
          </div>
        )}

        <div className="flex gap-4">
          <label className={CHECKBOX_LABEL_CLASS}><input type="checkbox" checked={hideNickname} onChange={(event) => setHideNickname(event.target.checked)} /> 隐藏昵称</label>
          <label className={CHECKBOX_LABEL_CLASS}><input type="checkbox" checked={hideMood} onChange={(event) => setHideMood(event.target.checked)} /> 隐藏心情</label>
        </div>

        {cardData.headlineStamp ? (
          <div className="mx-auto max-w-[320px] overflow-hidden rounded-3xl shadow-md">
            <ShareCard data={cardData} hideNickname={hideNickname} hideMood={hideMood} svgRef={cardSvgRef} />
          </div>
        ) : (
          <p className="rounded-2xl bg-porcelain p-6 text-center text-sm">这段时间还没有签到,先去打个卡吧。</p>
        )}

        {statusMessage && <p role="status" className="text-center text-sm">{statusMessage}</p>}
        <button disabled={!cardData.headlineStamp || isBusy} onClick={handleShareClick}
          className="w-full rounded-xl bg-brown p-3 font-semibold text-porcelain disabled:opacity-40">{isBusy ? '生成中…' : '分享图片'}</button>
      </div>
    </div>
  );
}
