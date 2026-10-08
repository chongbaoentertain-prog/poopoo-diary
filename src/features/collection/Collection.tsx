import { Poo } from '../../components/art/Poo';
import { CHARACTERS } from '../../data/characters';
import { useAppStore } from '../../store/useAppStore';

const SERIES = [...new Set(CHARACTERS.map((c) => c.series))];

export function Collection() {
  const progress = useAppStore((s) => s.progress);
  const activeId = useAppStore((s) => s.activeCharacterId);

  return (
    <section className="space-y-5">
      <h2 className="font-semibold">图鉴 · 已拥有 {progress.length} / {CHARACTERS.length}</h2>
      {SERIES.map((key) => {
        const list = CHARACTERS.filter((c) => c.series === key);
        const attr = list[0].attr;
        const own = list.filter((c) => progress.some((p) => p.characterId === c.id)).length;
        return (
          <div key={key} className="space-y-2">
            <h3 className="flex items-baseline justify-between font-semibold">
              <span>{attr}</span><span className="text-sm font-normal">{own} / {list.length}</span>
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {list.map((c, i) => {
                const p = progress.find((x) => x.characterId === c.id);
                return (
                  <article key={c.id} className="rounded-xl p-1.5 text-center"
                    style={{ background: `linear-gradient(160deg, ${c.accent}, color-mix(in srgb, ${c.accent} 55%, white))` }}>
                    <div className="text-[10px] opacity-70">{attr}{i + 1}</div>
                    <div className="flex justify-center"><Poo characterId={c.id} stage={p ? p.stage : 1} size={56} silhouette={!p} /></div>
                    <div className="text-[10px] leading-tight">{p ? c.stageNames[p.stage - 1] : '???'}</div>
                    <div className="h-3 text-[10px] opacity-70">{p ? (c.id === activeId ? '养成中' : p.graduated ? '已毕业' : '') : ''}</div>
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
