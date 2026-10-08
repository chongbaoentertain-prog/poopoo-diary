import { useState } from 'react';
import { CharacterPicker } from '../../components/CharacterPicker';
import { CHARACTERS, charDef } from '../../data/characters';
import { MAX_STAGE, STAGE_THRESHOLDS } from '../../domain/rules';
import { activeProgress } from '../../store/selectors';
import { useAppStore } from '../../store/useAppStore';

/** 满级后:继续养这一只(什么都不用做),或毕业并换新角色 */
export function GraduatePanel() {
  const progress = useAppStore(activeProgress);
  const owned = useAppStore((s) => s.progress);
  const graduateAndPick = useAppStore((s) => s.graduateAndPick);
  const [picking, setPicking] = useState(false);
  if (!progress) return null;

  const def = charDef(progress.characterId);
  const now = def.stageNames[progress.stage - 1];
  if (!progress.maxed) {
    return <p className="text-sm">还差 {STAGE_THRESHOLDS[MAX_STAGE - 1] - progress.xp} XP,「{now}」就能进化成「{def.stageNames[MAX_STAGE - 1]}」,之后可以毕业换新角色。</p>;
  }
  const available = CHARACTERS.filter((c) => !owned.some((p) => p.characterId === c.id));

  return (
    <div className="space-y-2 rounded-xl bg-tile p-3 text-sm">
      <p>「{now}」已达到最高形态!可以继续养它累积经验,或让它毕业进图鉴,再选一只新的。</p>
      {available.length === 0 ? <p>所有角色都已拥有啦。</p> : picking ? (
        <>
          <CharacterPicker options={available} onPick={(c) => {
            if (!window.confirm(`让「${now}」毕业进图鉴,换成「${c.name}」从头养成?`)) return;
            graduateAndPick(c.id);
            setPicking(false);
          }} />
          <div className="flex justify-center"><button onClick={() => setPicking(false)} className="rounded-lg bg-porcelain px-4 py-1">取消</button></div>
        </>
      ) : <div className="flex justify-center"><button onClick={() => setPicking(true)} className="rounded-lg bg-brown px-4 py-2 font-semibold text-porcelain">毕业并更换角色</button></div>}
    </div>
  );
}
