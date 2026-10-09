import { Poo } from '../components/poo/Poo';
import { CHARACTERS } from '../data/characters';
import { useAppStore } from '../hooks/useAppStore';
import { getLastMoodByCharacterId } from '../stores/selectors';

const SERIES_IDS = [...new Set(CHARACTERS.map((character) => character.seriesId))];

export function CollectionPage() {
  const progressList = useAppStore((state) => state.progress);
  const activeCharacterId = useAppStore((state) => state.activeCharacterId);
  const checkIns = useAppStore((state) => state.checkIns);
  const lastMoodByCharacterId = getLastMoodByCharacterId(checkIns); // 每只噗显示它最近一次签到时选的心情

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-semibold">图鉴 · 已收集 {progressList.length} / {CHARACTERS.length}</h2>
        <p className="text-xs opacity-70">养成并毕业后,还会遇到新的伙伴。集齐每个属性,解锁完整图鉴。</p>
      </div>
      {SERIES_IDS.map((seriesId) => {
        const seriesCharacters = CHARACTERS.filter((character) => character.seriesId === seriesId);
        const attribute = seriesCharacters[0].attribute;
        const ownedCount = seriesCharacters.filter((character) => progressList.some((entry) => entry.characterId === character.id)).length;
        return (
          <div key={seriesId} className="space-y-2">
            <h3 className="flex items-baseline justify-between font-semibold">
              <span>{attribute}</span><span className="text-sm font-normal">{ownedCount} / {seriesCharacters.length}</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {seriesCharacters.map((character, indexInSeries) => {
                const characterProgress = progressList.find((entry) => entry.characterId === character.id);
                return (
                  <article key={character.id} className="rounded-xl p-1.5 text-center"
                    style={{ background: `linear-gradient(160deg, ${character.accentColor}, color-mix(in srgb, ${character.accentColor} 55%, white))` }}>
                    <div className="text-[10px] opacity-70">{attribute}{indexInSeries + 1}</div>
                    <div className="flex justify-center">
                      <Poo characterId={character.id} stage={characterProgress ? characterProgress.stage : 1} size={84}
                        silhouette={!characterProgress} mood={lastMoodByCharacterId.get(character.id)} />
                    </div>
                    <div className="text-[10px] leading-tight">{characterProgress ? character.stageNames[characterProgress.stage - 1] : '???'}</div>
                    <div className="h-3 text-[10px] opacity-70">
                      {characterProgress ? (character.id === activeCharacterId ? '培育中' : characterProgress.graduated ? '已毕业' : '') : '等待相遇…'}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
