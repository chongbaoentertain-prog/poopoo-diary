import { useMemo, useRef, useState } from 'react';
import { addDays, toDateKey } from '../../domain/date';
import { useAppStore } from '../../hooks/useAppStore';
import type { DateKey } from '../../types/diary';
import { renderSvgToPng, shareOrDownloadImage } from './exportCardAsPng';
import { ShareCard } from './ShareCard';
import { buildShareCardData, getShareDateRange, MAX_SHARE_RANGE_DAYS, type ShareRangeKind } from './shareCardData';

const RANGE_OPTIONS: [ShareRangeKind, string][] = [['day', '当天'], ['week', '近 7 天'], ['month', '本月'], ['custom', '自定义']];
const CHECKBOX_LABEL_CLASS = 'flex items-center gap-2 text-sm';

interface ShareScreenProps {
  selectedDate: DateKey;
  onClose: () => void;
}

/**
 * 分享页(全屏):选范围 → 预览卡片 → 选择隐藏哪些信息 → 分享/下载图片。
 * 手机上整页展示:顶部返回栏,中间可滚动,底部固定分享按钮,拇指够得到。
 */
export function ShareScreen({ selectedDate, onClose }: ShareScreenProps) {
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
    <div className="fixed inset-0 z-20 flex flex-col bg-tile" role="dialog" aria-modal="true" aria-label="分享">
      <header className="flex items-center border-b border-grout bg-porcelain px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button onClick={onClose} aria-label="返回" className="rounded-lg px-4 py-2 text-2xl leading-none">‹</button>
        <h2 className="flex-1 text-center font-semibold">分享我的噗</h2>
        <span className="w-14" aria-hidden="true" /> {/* 和左边的返回按钮等宽,让标题居中 */}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-3 p-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="分享范围">
            {RANGE_OPTIONS.map(([optionKind, label]) => (
              <button key={optionKind} aria-pressed={rangeKind === optionKind} onClick={() => setRangeKind(optionKind)}
                className={`rounded-full px-3 py-1.5 text-sm ${rangeKind === optionKind ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>
                {optionKind === 'day' && selectedDate !== today ? `${Number(selectedDate.slice(5, 7))}月${Number(selectedDate.slice(8))}日` : label}
              </button>
            ))}
          </div>
          {rangeKind === 'custom' && (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <input type="date" value={customRange[0]} max={today} aria-label="开始日期" className="min-w-0 flex-1 rounded-lg border border-grout bg-porcelain p-1.5"
                  onChange={(event) => event.target.value && setCustomRange([event.target.value, customRange[1]])} />
                <span>至</span>
                <input type="date" value={customRange[1]} max={today} aria-label="结束日期" className="min-w-0 flex-1 rounded-lg border border-grout bg-porcelain p-1.5"
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
            <div className="mx-auto max-w-[360px] overflow-hidden rounded-3xl shadow-md">
              <ShareCard data={cardData} hideNickname={hideNickname} hideMood={hideMood} svgRef={cardSvgRef} />
            </div>
          ) : (
            <p className="rounded-2xl bg-porcelain p-6 text-center text-sm">这段时间还没有签到,先去打个卡吧。</p>
          )}
        </div>
      </div>

      <footer className="border-t border-grout bg-porcelain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-md space-y-2">
          {statusMessage && <p role="status" className="text-center text-sm">{statusMessage}</p>}
          <button disabled={!cardData.headlineStamp || isBusy} onClick={handleShareClick}
            className="w-full rounded-xl bg-brown p-3 font-semibold text-porcelain disabled:opacity-40">{isBusy ? '生成中…' : '分享图片'}</button>
        </div>
      </footer>
    </div>
  );
}
