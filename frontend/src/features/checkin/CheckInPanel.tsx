import { useState } from 'react';
import { Poo } from '../../components/poo/Poo';
import { getCharacter } from '../../data/characters';
import { DEFAULT_MOOD, MOODS } from '../../data/moods';
import { toDateKey } from '../../domain/date';
import { progressToNextStage } from '../../domain/evolution';
import { MAX_STAGE, STAGE_THRESHOLDS } from '../../domain/rules';
import { parseStampId, type Stamp } from '../../domain/stamp';
import { useAppStore } from '../../hooks/useAppStore';
import { getCurrentStreak, selectActiveProgress } from '../../stores/selectors';
import type { Mood } from '../../types/character';
import type { DateKey } from '../../types/diary';

interface CheckInPanelProps {
  date: DateKey;
}

export function CheckInPanel({ date }: CheckInPanelProps) {
  const activeProgress = useAppStore(selectActiveProgress);
  const checkIns = useAppStore((state) => state.checkIns);
  const checkIn = useAppStore((state) => state.checkIn);
  const [message, setMessage] = useState('');
  const [latestStamp, setLatestStamp] = useState<{ animationKey: number; stamp: Stamp } | null>(null);
  const [evolutionCount, setEvolutionCount] = useState(0); // 每进化一次加 1,用来重新触发进化动画
  const [selectedMood, setSelectedMood] = useState<Mood>(DEFAULT_MOOD);
  if (!activeProgress) return null;

  const character = getCharacter(activeProgress.characterId);
  const today = toDateKey(new Date());
  const hasCountedCheckIn = checkIns.some((record) => record.counted && record.date === date);
  const nextStageRequiredXp = activeProgress.stage < MAX_STAGE ? STAGE_THRESHOLDS[activeProgress.stage] : null;

  const handleCheckInClick = () => {
    const result = checkIn(date, selectedMood);
    const record = result.checkIn;
    setLatestStamp({ animationKey: Date.now(), stamp: parseStampId(record.stampId) });
    if (result.evolved) setEvolutionCount((count) => count + 1);

    const stageNameNow = character.stageNames[result.progress.stage - 1];
    const milestoneText = result.reachedMax ? ` · 「${stageNameNow}」已达到最高形态` : result.evolved ? ` · 进化成「${stageNameNow}」` : '';
    setMessage(
      record.counted
        ? `+${record.xpGained} XP · 连续 ${record.streak} 天 ×${record.multiplier}${milestoneText}`
        : '已记录(这天的经验已领取)',
    );
  };

  const checkInButtonLabel = hasCountedCheckIn
    ? (date === today ? '再签到一次(不计经验)' : '再补签一次(不计经验)')
    : (date === today ? '签到' : '补签');

  return (
    <section className="space-y-3 rounded-2xl bg-porcelain p-4">
      <div className="flex items-center gap-4">
        <div key={evolutionCount} className={evolutionCount ? 'animate-evolve' : ''}>
          <Poo characterId={activeProgress.characterId} stage={activeProgress.stage} size={112} mood={selectedMood} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="font-semibold">{character.stageNames[activeProgress.stage - 1]} <span className="text-xs font-normal" style={{ color: character.accentColor }}>{character.attribute}</span>
            <span className="text-sm font-normal"> · 连续 {getCurrentStreak(checkIns, today)} 天</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-grout" role="progressbar" aria-valuenow={Math.round(progressToNextStage(activeProgress.xp) * 100)}>
            <div className="h-full bg-gold transition-[width]" style={{ width: `${progressToNextStage(activeProgress.xp) * 100}%` }} />
          </div>
          <div className="text-xs">{nextStageRequiredXp ? `${activeProgress.xp} / ${nextStageRequiredXp} XP` : `${activeProgress.xp} XP(最高形态)`}</div>
          <button onClick={handleCheckInClick} className="w-full rounded-xl bg-brown p-2 font-semibold text-porcelain">
            {checkInButtonLabel}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-xs">{date === today ? '今天' : '这天'}的心情(图鉴会显示最近一次签到的心情)</div>
        <div className="grid grid-cols-7 gap-1" role="group" aria-label="心情">
          {MOODS.map((moodOption) => (
            <button key={moodOption.id} aria-pressed={selectedMood === moodOption.id} onClick={() => setSelectedMood(moodOption.id)}
              className={`rounded-lg border-2 bg-tile py-0.5 text-center ${selectedMood === moodOption.id ? 'border-gold' : 'border-transparent'}`}>
              <div className="flex justify-center"><Poo characterId={activeProgress.characterId} stage={activeProgress.stage} size={34} mood={moodOption.id} showScene={false} /></div>
              <div className="text-[10px] leading-tight">{moodOption.label}</div>
            </button>
          ))}
        </div>
      </div>
      {message && (
        <div role="status" className="flex items-center gap-2 text-sm">
          {latestStamp && (
            <div key={latestStamp.animationKey} className="animate-stamp">
              <Poo characterId={latestStamp.stamp.characterId} stage={latestStamp.stamp.stage} size={36} mood={latestStamp.stamp.mood} showScene={false} />
            </div>
          )}
          <span>{message}</span>
        </div>
      )}
    </section>
  );
}
