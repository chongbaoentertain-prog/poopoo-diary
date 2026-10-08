import { useMemo, useState } from 'react';
import { addDays, toDateKey } from '../../domain/date';
import { useAppStore } from '../../store/useAppStore';

const MAX_DAYS = 400;

export function BatchPanel() {
  const checkIns = useAppStore((s) => s.checkIns);
  const run = useAppStore((s) => s.checkInMany);
  const today = toDateKey(new Date());
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [msg, setMsg] = useState('');

  const days = useMemo(() => {
    const out: string[] = [];
    for (let d = from; d <= to && d <= today && out.length < MAX_DAYS; d = addDays(d, 1)) out.push(d);
    return out;
  }, [from, to, today]);
  const done = new Set(checkIns.filter((c) => c.counted).map((c) => c.date));
  const todo = days.filter((d) => !done.has(d));

  return (
    <section className="space-y-2 rounded-2xl bg-porcelain p-3">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full text-left font-semibold">批量打卡 {open ? '▾' : '▸'}</button>
      {open && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <input type="date" value={from} max={today} onChange={(e) => e.target.value && setFrom(e.target.value)} className="rounded-lg border border-grout p-1" aria-label="开始日期" />
            <span>至</span>
            <input type="date" value={to} max={today} onChange={(e) => e.target.value && setTo(e.target.value)} className="rounded-lg border border-grout p-1" aria-label="结束日期" />
          </div>
          <p>范围共 {days.length} 天,其中 {todo.length} 天还没打卡{days.length >= MAX_DAYS ? `(最多 ${MAX_DAYS} 天)` : ''}。</p>
          <button disabled={todo.length === 0} className="w-full rounded-xl bg-brown p-2 font-semibold text-porcelain disabled:opacity-40"
            onClick={() => {
              const r = run(days);
              setMsg(`已补 ${r.added} 天 · 共 +${r.xpGained} XP${r.evolved ? ' · 进化了!' : ''}${r.reachedMax ? ' · 已达最高形态' : ''}`);
            }}>打卡这 {todo.length} 天</button>
          {msg && <p role="status">{msg}</p>}
        </div>
      )}
    </section>
  );
}
