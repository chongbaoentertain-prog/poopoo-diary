import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { Poo } from '../../components/poo/Poo';
import { getCharacter } from '../../data/characters';
import { DEFAULT_MOOD } from '../../data/moods';
import { addMonthsToDateKey, getMonthGrid, getWeekDateKeys, isInSameMonth } from '../../domain/calendarGrid';
import { addDays, toDateKey } from '../../domain/date';
import { parseStampId } from '../../domain/stamp';
import { useAppStore } from '../../hooks/useAppStore';
import { appStore } from '../../stores/appStore';
import { groupCheckInsByDate, selectActiveProgress } from '../../stores/selectors';
import type { DateKey } from '../../types/diary';

type CalendarViewMode = 'week' | 'month';

const WEEKDAY_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];
const QUICK_ACTION_BUTTON_CLASS = 'rounded-lg bg-tile px-3 py-1';
const MAX_DRAG_RANGE_DAYS = 400;

/** 两个日期之间(含两端)的所有日期,不管谁先谁后 */
const getDateRangeBetween = (firstDate: DateKey, secondDate: DateKey): DateKey[] => {
  const [startDate, endDate] = firstDate < secondDate ? [firstDate, secondDate] : [secondDate, firstDate];
  const dates: DateKey[] = [];
  for (let date = startDate; date <= endDate && dates.length < MAX_DRAG_RANGE_DAYS; date = addDays(date, 1)) dates.push(date);
  return dates;
};

interface DragSelection {
  startDate: DateKey;
  isAdding: boolean; // 这次拖动是在"选中"还是"取消选中"
  selectionBeforeDrag: Set<DateKey>;
}

interface CalendarProps {
  selectedDate: DateKey;
  onSelectDate: (date: DateKey) => void;
}

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const today = toDateKey(new Date());
  const checkIns = useAppStore((state) => state.checkIns);
  const checkInOnDates = useAppStore((state) => state.checkInOnDates);
  const checkInsByDate = useMemo(() => groupCheckInsByDate(checkIns), [checkIns]);
  const datesWithCountedCheckIn = useMemo(
    () => new Set(checkIns.filter((checkIn) => checkIn.counted).map((checkIn) => checkIn.date)),
    [checkIns],
  );
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [anchorDate, setAnchorDate] = useState(today);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<DateKey>>(new Set());
  const [message, setMessage] = useState('');
  const dragSelection = useRef<DragSelection | null>(null);

  const isSelectable = (date: DateKey) => date <= today && !datesWithCountedCheckIn.has(date);

  const getDateAtPointer = (event: PointerEvent): DateKey | undefined =>
    (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-date]')?.dataset.date;

  const paintSelectionUntil = (currentDate: DateKey) => {
    const drag = dragSelection.current!;
    const nextSelection = new Set(drag.selectionBeforeDrag);
    for (const date of getDateRangeBetween(drag.startDate, currentDate)) {
      if (!isSelectable(date)) continue;
      if (drag.isAdding) nextSelection.add(date); else nextSelection.delete(date);
    }
    setSelectedDates(nextSelection);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const date = isMultiSelectMode ? getDateAtPointer(event) : undefined;
    if (!date || !isSelectable(date)) return;
    dragSelection.current = { startDate: date, isAdding: !selectedDates.has(date), selectionBeforeDrag: new Set(selectedDates) };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    paintSelectionUntil(date);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragSelection.current) return;
    const date = getDateAtPointer(event);
    if (date) paintSelectionUntil(date);
  };

  const toggleDate = (date: DateKey) => isSelectable(date) && setSelectedDates((currentSelection) => {
    const nextSelection = new Set(currentSelection);
    if (nextSelection.has(date)) nextSelection.delete(date); else nextSelection.add(date);
    return nextSelection;
  });

  const confirmBulkCheckIn = () => {
    const result = checkInOnDates([...selectedDates]);
    const activeProgress = selectActiveProgress(appStore.getState());
    const stageName = activeProgress ? getCharacter(activeProgress.characterId).stageNames[activeProgress.stage - 1] : '';
    const milestoneText = result.reachedMax ? ` · 「${stageName}」已达到最高形态` : result.evolved ? ` · 进化成「${stageName}」` : '';
    setMessage(`已补签 ${result.addedDayCount} 天 · 共 +${result.xpGained} XP${milestoneText}`);
    setSelectedDates(new Set());
    setIsMultiSelectMode(false);
  };

  const goToAdjacentPeriod = (direction: 1 | -1) =>
    setAnchorDate(viewMode === 'week' ? addDays(anchorDate, 7 * direction) : addMonthsToDateKey(anchorDate, direction));

  const weeks = viewMode === 'week' ? [getWeekDateKeys(anchorDate)] : getMonthGrid(anchorDate);
  const title = viewMode === 'month'
    ? `${anchorDate.slice(0, 4)}年${Number(anchorDate.slice(5, 7))}月`
    : `${weeks[0][0].slice(5).replace('-', '月')}日 起一周`;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <button aria-label="上一页" onClick={() => goToAdjacentPeriod(-1)} className="rounded-lg bg-porcelain px-3 py-1">‹</button>
        <h2 className="flex-1 text-center font-semibold">{title}</h2>
        <button aria-label="下一页" onClick={() => goToAdjacentPeriod(1)} className="rounded-lg bg-porcelain px-3 py-1">›</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="视图" className="flex overflow-hidden rounded-lg border border-grout">
          {(['week', 'month'] as CalendarViewMode[]).map((mode) => (
            <button key={mode} aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1 ${viewMode === mode ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>{mode === 'week' ? '周' : '月'}</button>
          ))}
        </div>
        <button onClick={() => { setAnchorDate(today); onSelectDate(today); }} className="rounded-lg border border-brown bg-gold/40 px-3 py-1 text-brown">回到今天</button>
        <button aria-pressed={isMultiSelectMode} onClick={() => { setIsMultiSelectMode(!isMultiSelectMode); setSelectedDates(new Set()); setMessage(''); }}
          className={`ml-auto rounded-lg px-3 py-1 font-semibold ${isMultiSelectMode ? 'bg-brown text-porcelain' : 'bg-gold text-ink'}`}>{isMultiSelectMode ? '退出多选' : '多选补签'}</button>
      </div>

      {isMultiSelectMode && (
        <div className="space-y-2 rounded-xl bg-porcelain p-3 text-sm">
          <p>点选或拖动日期来多选(已签到的日子不能选)。已选 <b>{selectedDates.size}</b> 天。</p>
          <div className="flex flex-wrap gap-2">
            <button className={QUICK_ACTION_BUTTON_CLASS}
              onClick={() => setSelectedDates(new Set([...selectedDates, ...getMonthGrid(anchorDate).flat().filter((date) => isInSameMonth(date, anchorDate) && isSelectable(date))]))}>选中本月未签到</button>
            <button className={QUICK_ACTION_BUTTON_CLASS} onClick={() => setSelectedDates(new Set())}>清空</button>
            <button disabled={!selectedDates.size} onClick={confirmBulkCheckIn} className="ml-auto rounded-lg bg-brown px-4 py-1 font-semibold text-porcelain disabled:opacity-40">补签 {selectedDates.size} 天</button>
          </div>
        </div>
      )}
      {message && <p role="status" className="text-sm">{message}</p>}

      <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => (dragSelection.current = null)} onPointerCancel={() => (dragSelection.current = null)}
        style={{ touchAction: isMultiSelectMode ? 'none' : undefined }}
        className="grid select-none grid-cols-7 gap-px overflow-hidden rounded-xl border border-grout bg-grout">
        {WEEKDAY_HEADERS.map((header) => <div key={header} className="bg-tile py-1 text-center text-xs">{header}</div>)}
        {weeks.flat().map((date) => {
          const dayCheckIns = checkInsByDate.get(date) ?? [];
          const representativeCheckIn = dayCheckIns.find((checkIn) => checkIn.counted) ?? dayCheckIns[0]; // 角色和形态取当天计经验的那条
          const stamp = representativeCheckIn ? parseStampId(representativeCheckIn.stampId) : null;
          const latestCheckIn = dayCheckIns[dayCheckIns.length - 1];
          const mood = latestCheckIn ? parseStampId(latestCheckIn.stampId).mood : DEFAULT_MOOD; // 心情以当天最新一次为准
          const isPicked = isMultiSelectMode && selectedDates.has(date);
          return (
            <button key={date} data-date={date} disabled={date > today} aria-label={`${date},${dayCheckIns.length} 次记录`} aria-pressed={isMultiSelectMode ? isPicked : date === selectedDate}
              onClick={(event) => (isMultiSelectMode ? event.detail === 0 && toggleDate(date) : onSelectDate(date))}
              className={`relative flex aspect-square flex-col items-center justify-between p-1 text-xs disabled:opacity-40
                ${isPicked ? 'bg-gold/50' : viewMode === 'month' && !isInSameMonth(date, anchorDate) ? 'bg-tile' : 'bg-porcelain'}
                ${!isMultiSelectMode && date === selectedDate ? 'outline-2 outline-gold -outline-offset-2' : ''}`}>
              <span className={date === today ? 'rounded-full bg-gold px-1.5 font-semibold' : ''}>{Number(date.slice(8))}</span>
              {stamp && <Poo characterId={stamp.characterId} stage={stamp.stage} mood={mood} size={viewMode === 'week' ? 44 : 30} showScene={false} />}
              {dayCheckIns.length > 1 && <span className="absolute right-0.5 top-0.5 text-[10px]">×{dayCheckIns.length}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
