import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { Poo } from '../../components/art/Poo';
import { charDef, type Mood } from '../../data/characters';
import { addDays, toDateKey } from '../../domain/date';
import { activeProgress, groupByDate } from '../../store/selectors';
import { appStore, useAppStore } from '../../store/useAppStore';
import { addMonths, inMonth, monthGrid, weekDays } from './grid';

type View = 'week' | 'month';
const HEAD = ['一', '二', '三', '四', '五', '六', '日'];
const chip = 'rounded-lg bg-tile px-3 py-1';

const span = (a: string, b: string) => {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const out: string[] = [];
  for (let d = lo; d <= hi && out.length < 400; d = addDays(d, 1)) out.push(d);
  return out;
};

export function Calendar({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const today = toDateKey(new Date());
  const checkIns = useAppStore((s) => s.checkIns);
  const run = useAppStore((s) => s.checkInMany);
  const byDate = useMemo(() => groupByDate(checkIns), [checkIns]);
  const counted = useMemo(() => new Set(checkIns.filter((c) => c.counted).map((c) => c.date)), [checkIns]);
  const [view, setView] = useState<View>('month');
  const [anchor, setAnchor] = useState(today);
  const [multi, setMulti] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');
  const drag = useRef<{ start: string; add: boolean; base: Set<string> } | null>(null);

  const selectable = (d: string) => d <= today && !counted.has(d);
  const dateAt = (e: PointerEvent) =>
    (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-date]')?.dataset.date;
  const paint = (cur: string) => {
    const dr = drag.current!;
    const next = new Set(dr.base);
    for (const d of span(dr.start, cur)) if (selectable(d)) (dr.add ? next.add(d) : next.delete(d));
    setSel(next);
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    const d = multi ? dateAt(e) : undefined;
    if (!d || !selectable(d)) return;
    drag.current = { start: d, add: !sel.has(d), base: new Set(sel) };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    paint(d);
  };
  const move = (e: PointerEvent) => { if (drag.current) { const d = dateAt(e); if (d) paint(d); } };
  const toggle = (d: string) => selectable(d) && setSel((s) => { const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n; });

  const confirm = () => {
    const r = run([...sel]);
    const p = activeProgress(appStore.getState());
    const name = p ? charDef(p.characterId).stageNames[p.stage - 1] : '';
    setMsg(`已补签 ${r.added} 天 · 共 +${r.xpGained} XP${r.reachedMax ? ` · 「${name}」已达到最高形态` : r.evolved ? ` · 进化成「${name}」` : ''}`);
    setSel(new Set()); setMulti(false);
  };

  const step = (n: number) => setAnchor(view === 'week' ? addDays(anchor, 7 * n) : addMonths(anchor, n));
  const weeks = view === 'week' ? [weekDays(anchor)] : monthGrid(anchor);
  const title = view === 'month' ? `${anchor.slice(0, 4)}年${+anchor.slice(5, 7)}月` : `${weeks[0][0].slice(5).replace('-', '月')}日 起一周`;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <button aria-label="上一页" onClick={() => step(-1)} className="rounded-lg bg-porcelain px-3 py-1">‹</button>
        <h2 className="flex-1 text-center font-semibold">{title}</h2>
        <button aria-label="下一页" onClick={() => step(1)} className="rounded-lg bg-porcelain px-3 py-1">›</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="视图" className="flex overflow-hidden rounded-lg border border-grout">
          {(['week', 'month'] as View[]).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}
              className={`px-3 py-1 ${view === v ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>{v === 'week' ? '周' : '月'}</button>
          ))}
        </div>
        <button onClick={() => { setAnchor(today); onSelect(today); }} className="rounded-lg border border-brown bg-gold/40 px-3 py-1 text-brown">回到今天</button>
        <button aria-pressed={multi} onClick={() => { setMulti(!multi); setSel(new Set()); setMsg(''); }}
          className={`ml-auto rounded-lg px-3 py-1 font-semibold ${multi ? 'bg-brown text-porcelain' : 'bg-gold text-ink'}`}>{multi ? '退出多选' : '多选补签'}</button>
      </div>

      {multi && (
        <div className="space-y-2 rounded-xl bg-porcelain p-3 text-sm">
          <p>点选或拖动日期来多选(已签到的日子不能选)。已选 <b>{sel.size}</b> 天。</p>
          <div className="flex flex-wrap gap-2">
            <button className={chip} onClick={() => setSel(new Set([...sel, ...monthGrid(anchor).flat().filter((d) => inMonth(d, anchor) && selectable(d))]))}>选中本月未签到</button>
            <button className={chip} onClick={() => setSel(new Set())}>清空</button>
            <button disabled={!sel.size} onClick={confirm} className="ml-auto rounded-lg bg-brown px-4 py-1 font-semibold text-porcelain disabled:opacity-40">补签 {sel.size} 天</button>
          </div>
        </div>
      )}
      {msg && <p role="status" className="text-sm">{msg}</p>}

      <div onPointerDown={down} onPointerMove={move} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)}
        style={{ touchAction: multi ? 'none' : undefined }}
        className="grid select-none grid-cols-7 gap-px overflow-hidden rounded-xl border border-grout bg-grout">
        {HEAD.map((h) => <div key={h} className="bg-tile py-1 text-center text-xs">{h}</div>)}
        {weeks.flat().map((d) => {
          const list = byDate.get(d) ?? [];
          const first = list.find((c) => c.counted) ?? list[0];
          const [cid, stage, mk] = first ? first.stampId.split(':') : [];
          const picked = multi && sel.has(d);
          return (
            <button key={d} data-date={d} disabled={d > today} aria-label={`${d},${list.length} 次记录`} aria-pressed={multi ? picked : d === selected}
              onClick={(e) => (multi ? e.detail === 0 && toggle(d) : onSelect(d))}
              className={`relative flex aspect-square flex-col items-center justify-between p-1 text-xs disabled:opacity-40
                ${picked ? 'bg-gold/50' : view === 'month' && !inMonth(d, anchor) ? 'bg-tile' : 'bg-porcelain'}
                ${!multi && d === selected ? 'outline-2 outline-gold -outline-offset-2' : ''}`}>
              <span className={d === today ? 'rounded-full bg-gold px-1.5 font-semibold' : ''}>{+d.slice(8)}</span>
              {first && <Poo characterId={cid} stage={+stage} mood={(mk as Mood) ?? 'happy'} size={view === 'week' ? 44 : 30} />}
              {list.length > 1 && <span className="absolute right-0.5 top-0.5 text-[10px]">×{list.length}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
