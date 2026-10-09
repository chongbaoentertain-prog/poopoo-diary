import { useState } from 'react';
import { getMonthGrid, isInSameMonth } from '../domain/calendarGrid';
import { addDays } from '../domain/date';
import { useAppStore } from '../hooks/useAppStore';

export function ReviewPage() {
  const checkIns = useAppStore((state) => state.checkIns);
  const thisYear = new Date().getFullYear();
  const earliestYear = Math.min(thisYear, ...checkIns.map((checkIn) => Number(checkIn.date.slice(0, 4))));
  const [selectedYear, setSelectedYear] = useState(thisYear);

  const checkInsInYear = checkIns.filter((checkIn) => checkIn.date.startsWith(`${selectedYear}-`));
  const countedCheckInsInYear = checkInsInYear.filter((checkIn) => checkIn.counted);
  const checkedInDates = [...new Set(countedCheckInsInYear.map((checkIn) => checkIn.date))].sort();

  let longestStreak = 0;
  let currentStreak = 0;
  checkedInDates.forEach((date, index) => {
    const continuesPreviousDay = index > 0 && addDays(checkedInDates[index - 1], 1) === date;
    currentStreak = continuesPreviousDay ? currentStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  });

  const totalXp = countedCheckInsInYear.reduce((sum, checkIn) => sum + checkIn.xpGained, 0);
  const checkInCountByDate = new Map<string, number>();
  checkInsInYear.forEach((checkIn) => checkInCountByDate.set(checkIn.date, (checkInCountByDate.get(checkIn.date) ?? 0) + 1));
  const summaryStats: [label: string, value: number][] = [
    ['签到天数', checkedInDates.length],
    ['最长连续', longestStreak],
    ['获得经验', totalXp],
    ['记录次数', checkInsInYear.length],
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <button aria-label="上一年" disabled={selectedYear <= earliestYear} onClick={() => setSelectedYear(selectedYear - 1)} className="rounded-lg bg-porcelain px-3 py-1 disabled:opacity-40">‹</button>
        <h2 className="flex-1 text-center font-semibold">{selectedYear} 年回顾</h2>
        <button aria-label="下一年" disabled={selectedYear >= thisYear} onClick={() => setSelectedYear(selectedYear + 1)} className="rounded-lg bg-porcelain px-3 py-1 disabled:opacity-40">›</button>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {summaryStats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-porcelain p-2"><div className="text-lg font-semibold">{value}</div><div className="text-[11px]">{label}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 12 }, (_, monthIndex) => {
          const firstDayOfMonth = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
          const checkedInDayCount = checkedInDates.filter((date) => date.startsWith(firstDayOfMonth.slice(0, 7))).length;
          return (
            <div key={firstDayOfMonth} className="space-y-1 rounded-xl bg-porcelain p-2">
              <div className="flex justify-between text-xs"><span>{monthIndex + 1}月</span><span>{checkedInDayCount} 天</span></div>
              <div className="grid grid-cols-7 gap-0.5">
                {getMonthGrid(firstDayOfMonth).flat().map((date) => {
                  const recordCount = checkInCountByDate.get(date) ?? 0;
                  const cellColor = !isInSameMonth(date, firstDayOfMonth) ? 'invisible' : recordCount === 0 ? 'bg-grout/60' : recordCount === 1 ? 'bg-gold' : 'bg-brown';
                  return <div key={date} title={`${date}:${recordCount} 次`} className={`aspect-square rounded-sm ${cellColor}`} />;
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
