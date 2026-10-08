import { useState } from 'react';
import { Poo } from '../../components/art/Poo';
import { charDef, randomMood, type Mood } from '../../data/characters';
import { toDateKey } from '../../domain/date';
import { progressToNext } from '../../domain/evolution';
import { MAX_STAGE, STAGE_THRESHOLDS } from '../../domain/rules';
import { activeProgress, currentStreak } from '../../store/selectors';
import { useAppStore } from '../../store/useAppStore';

export function CheckInPanel({ date }: { date: string }) {
  const progress = useAppStore(activeProgress);
  const checkIns = useAppStore((s) => s.checkIns);
  const checkIn = useAppStore((s) => s.checkIn);
  const [msg, setMsg] = useState('');
  const [stamp, setStamp] = useState<{ n: number; cid: string; stage: number; mood: Mood } | null>(null);
  const [evolveN, setEvolveN] = useState(0);
  const [mood, setMood] = useState<Mood>(() => randomMood(progress?.characterId ?? ''));
  if (!progress) return null;

  const def = charDef(progress.characterId);
  const today = toDateKey(new Date());
  const counted = checkIns.some((c) => c.counted && c.date === date);
  const next = progress.stage < MAX_STAGE ? STAGE_THRESHOLDS[progress.stage] : null;

  const onClick = () => {
    const r = checkIn(date);
    const c = r.checkIn;
    const [cid, stage, mk] = c.stampId.split(':');
    setMood(mk as Mood);
    setStamp({ n: Date.now(), cid, stage: +stage, mood: mk as Mood });
    if (r.evolved) setEvolveN((n) => n + 1);
    setMsg(!c.counted ? '已记录(这天的经验已领取)'
      : `+${c.xpGained} XP · 连续 ${c.streak} 天 ×${c.multiplier}${r.reachedMax ? ` · 「${def.stageNames[r.progress.stage - 1]}」已达到最高形态` : r.evolved ? ` · 进化成「${def.stageNames[r.progress.stage - 1]}」` : ''}`);
  };

  return (
    <section className="space-y-3 rounded-2xl bg-porcelain p-4">
      <div className="flex items-center gap-4">
        <div key={evolveN} className={evolveN ? 'animate-evolve' : ''}><Poo characterId={progress.characterId} stage={progress.stage} size={112} mood={mood} /></div>
        <div className="flex-1 space-y-2">
          <div className="font-semibold">{def.stageNames[progress.stage - 1]} <span className="text-xs font-normal" style={{ color: def.accent }}>{def.attr}</span>
            <span className="text-sm font-normal"> · 连续 {currentStreak(checkIns, today)} 天</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-grout" role="progressbar" aria-valuenow={Math.round(progressToNext(progress.xp) * 100)}>
            <div className="h-full bg-gold transition-[width]" style={{ width: `${progressToNext(progress.xp) * 100}%` }} />
          </div>
          <div className="text-xs">{next ? `${progress.xp} / ${next} XP` : `${progress.xp} XP(最高形态)`}</div>
          <button onClick={onClick} className="w-full rounded-xl bg-brown p-2 font-semibold text-porcelain">
            {counted ? (date === today ? '再签到一次(不计经验)' : '再补签一次(不计经验)') : date === today ? '签到' : '补签'}
          </button>
        </div>
      </div>
      {msg && (
        <div role="status" className="flex items-center gap-2 text-sm">
          {stamp && <div key={stamp.n} className="animate-stamp"><Poo characterId={stamp.cid} stage={stamp.stage} size={36} mood={stamp.mood} /></div>}
          <span>{msg}</span>
        </div>
      )}
    </section>
  );
}
