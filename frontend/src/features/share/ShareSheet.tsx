import { useMemo, useRef, useState } from 'react';
import { addDays, toDateKey } from '../../domain/date';
import { useAppStore } from '../../hooks/useAppStore';
import { buildShareData, MAX_SHARE_DAYS, rangeFor, type RangeKind } from './shareCardData';
import { shareOrDownload, svgToPng } from './exportCardAsPng';
import { ShareCard } from './ShareCard';

const KINDS: [RangeKind, string][] = [['day', '当天'], ['week', '近 7 天'], ['month', '本月'], ['custom', '自定义']];

/** 分享面板:选范围 → 预览卡片 → 选择隐藏哪些信息 → 分享/下载图片 */
export function ShareSheet({ selected, onClose }: { selected: string; onClose: () => void }) {
  const today = toDateKey(new Date());
  const checkIns = useAppStore((s) => s.checkIns);
  const profile = useAppStore((s) => s.profile);
  const [kind, setKind] = useState<RangeKind>('day');
  const [custom, setCustom] = useState<[string, string]>([addDays(today, -13), today]);
  const [hideNickname, setHideNickname] = useState(false);
  const [hideMood, setHideMood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const [from, to] = rangeFor(kind, selected, today, custom);
  const data = useMemo(() => buildShareData(checkIns, profile, from, to), [checkIns, profile, from, to]);

  const run = async () => {
    if (!svgRef.current) return;
    setBusy(true);
    try {
      const outcome = await shareOrDownload(await svgToPng(svgRef.current), `poopoo-${from}${from === to ? '' : `_${to}`}`);
      setMsg(outcome === 'downloaded' ? '图片已保存,可以发给朋友啦' : outcome === 'shared' ? '已分享' : '');
    } catch {
      setMsg('生成图片失败,请再试一次');
    } finally {
      setBusy(false);
    }
  };

  const check = 'flex items-center gap-2 text-sm';
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="分享" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-tile p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">分享我的噗</h2>
          <button onClick={onClose} aria-label="关闭" className="rounded-lg bg-porcelain px-3 py-1">✕</button>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="分享范围">
          {KINDS.map(([k, label]) => (
            <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-sm ${kind === k ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>
              {k === 'day' && selected !== today ? `${+selected.slice(5, 7)}月${+selected.slice(8)}日` : label}
            </button>
          ))}
        </div>
        {kind === 'custom' && (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <input type="date" value={custom[0]} max={today} aria-label="开始日期" className="rounded-lg border border-grout p-1"
                onChange={(e) => e.target.value && setCustom([e.target.value, custom[1]])} />
              <span>至</span>
              <input type="date" value={custom[1]} max={today} aria-label="结束日期" className="rounded-lg border border-grout p-1"
                onChange={(e) => e.target.value && setCustom([custom[0], e.target.value])} />
            </div>
            <p className="text-xs opacity-70">最多 {MAX_SHARE_DAYS} 天,超出的部分会被截掉。</p>
          </div>
        )}

        <div className="flex gap-4">
          <label className={check}><input type="checkbox" checked={hideNickname} onChange={(e) => setHideNickname(e.target.checked)} /> 隐藏昵称</label>
          <label className={check}><input type="checkbox" checked={hideMood} onChange={(e) => setHideMood(e.target.checked)} /> 隐藏心情</label>
        </div>

        {data.headline ? (
          <div className="mx-auto max-w-[320px] overflow-hidden rounded-3xl shadow-md">
            <ShareCard data={data} hideNickname={hideNickname} hideMood={hideMood} svgRef={svgRef} />
          </div>
        ) : (
          <p className="rounded-2xl bg-porcelain p-6 text-center text-sm">这段时间还没有签到,先去打个卡吧。</p>
        )}

        {msg && <p role="status" className="text-center text-sm">{msg}</p>}
        <button disabled={!data.headline || busy} onClick={run}
          className="w-full rounded-xl bg-brown p-3 font-semibold text-porcelain disabled:opacity-40">{busy ? '生成中…' : '分享图片'}</button>
      </div>
    </div>
  );
}
