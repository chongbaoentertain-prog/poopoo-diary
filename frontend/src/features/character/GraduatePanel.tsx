import { useState } from 'react';
import { CharacterPicker } from '../../components/CharacterPicker';
import { CHARACTERS, getCharacter } from '../../data/characters';
import { MAX_STAGE, STAGE_THRESHOLDS } from '../../domain/rules';
import { useAppStore } from '../../hooks/useAppStore';
import { selectActiveProgress } from '../../stores/selectors';

/** 满级后:继续养这一只(什么都不用做),或毕业并换新角色 */
export function GraduatePanel({ onCharacterChosen }: { onCharacterChosen?: () => void }) {
  const activeProgress = useAppStore(selectActiveProgress);
  const ownedProgress = useAppStore((state) => state.progress);
  const graduateAndChooseCharacter = useAppStore((state) => state.graduateAndChooseCharacter);
  const [isPicking, setIsPicking] = useState(false);
  if (!activeProgress) return null;

  const character = getCharacter(activeProgress.characterId);
  const currentStageName = character.stageNames[activeProgress.stage - 1];
  if (!activeProgress.maxed) {
    return (
      <p className="text-sm">
        还差 {STAGE_THRESHOLDS[MAX_STAGE - 1] - activeProgress.xp} XP,「{currentStageName}」就能进化成「{character.stageNames[MAX_STAGE - 1]}」,之后可以毕业换新角色。
      </p>
    );
  }
  const unownedCharacters = CHARACTERS.filter((candidate) => !ownedProgress.some((entry) => entry.characterId === candidate.id));

  return (
    <div className="space-y-2 rounded-xl bg-tile p-3 text-sm">
      <p>「{currentStageName}」已达到最高形态!可以继续养它累积经验,或让它毕业进图鉴,再选一只新的。</p>
      {unownedCharacters.length === 0 ? <p>所有角色都已拥有啦。</p> : isPicking ? (
        <>
          <div>
            <div className="font-semibold">迎接新的伙伴</div>
            <div>上一只已经圆满毕业,图鉴里永远有它的位置。</div>
          </div>
          <CharacterPicker requiresConfirmation options={unownedCharacters} onPick={(chosenCharacter) => {
            if (!window.confirm(`让「${currentStageName}」毕业进图鉴,换成「${chosenCharacter.name}」从头养成?`)) return;
            graduateAndChooseCharacter(chosenCharacter.id);
            setIsPicking(false);
            onCharacterChosen?.();
          }} />
          <div className="flex justify-center"><button onClick={() => setIsPicking(false)} className="rounded-lg bg-porcelain px-4 py-1">取消</button></div>
        </>
      ) : (
        <div className="flex justify-center">
          <button onClick={() => setIsPicking(true)} className="rounded-lg bg-brown px-4 py-2 font-semibold text-porcelain">毕业并更换角色</button>
        </div>
      )}
    </div>
  );
}
