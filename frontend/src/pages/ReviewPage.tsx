import { useState } from 'react';
import { addDays } from '../domain/date';
import { useAppStore } from '../hooks/useAppStore';
import { inMonth, monthGrid } from '../domain/calendarGrid';

export function Review() {
  const checkIns = useAppStore((s) => s.checkIns);
  const thisYear = new Date().getFullYear();
  const minYear = Math.min(thisYear, ...checkIns.map((c) => +c.date.slice(0, 4)));
  const [year, setYear] = useState(thisYear);

  const inYear = checkIns.filter((c) => c.date.startsWith(`${year}-`));
  const days = [...new Set(inYear.filter((c) => c.counted).map((c) => c.date))].sort();
  let longest = 0, run = 0;
  days.forEach((d, i) => { run = i > 0 && addDays(days[i - 1], 1) === d ? run + 1 : 1; longest = Math.max(longest, run); });
  const xp = inYear.filter((c) => c.counted).reduce((s, c) => s + c.xpGained, 0);
  const perDay = new Map<string, number>();
  inYear.forEach((c) => perDay.set(c.date, (perDay.get(c.date) ?? 0) + 1));
  const stats: [string, number][] = [['签到天数', days.length], ['最长连续', longest], ['获得经验', xp], ['记录次数', inYear.length]];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <button aria-label="上一年" disabled={year <= minYear} onClick={() => setYear(year - 1)} className="rounded-lg bg-porcelain px-3 py-1 disabled:opacity-40">‹</button>
        <h2 className="flex-1 text-center font-semibold">{year} 年回顾</h2>
        <button aria-label="下一年" disabled={year >= thisYear} onClick={() => setYear(year + 1)} className="rounded-lg bg-porcelain px-3 py-1 disabled:opacity-40">›</button>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {stats.map(([k, v]) => <div key={k} className="rounded-xl bg-porcelain p-2"><div className="text-lg font-semibold">{v}</div><div className="text-[11px]">{k}</div></div>)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 12 }, (_, i) => {
          const first = `${year}-${String(i + 1).padStart(2, '0')}-01`;
          const n = days.filter((d) => d.startsWith(first.slice(0, 7))).length;
          return (
            <div key={first} className="space-y-1 rounded-xl bg-porcelain p-2">
              <div className="flex justify-between text-xs"><span>{i + 1}月</span><span>{n} 天</span></div>
              <div className="grid grid-cols-7 gap-0.5">
                {monthGrid(first).flat().map((d) => {
                  const c = perDay.get(d) ?? 0;
                  return <div key={d} title={`${d}:${c} 次`} className={`aspect-square rounded-sm ${!inMonth(d, first) ? 'invisible' : c === 0 ? 'bg-grout/60' : c === 1 ? 'bg-gold' : 'bg-brown'}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs">颜色越深,当天记录越多。想看某一天的细节,回到「首页」翻月份查看。</p>
    </section>
  );
}
