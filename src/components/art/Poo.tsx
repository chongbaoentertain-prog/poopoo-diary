import { charDef, poseFor, type Acc, type Mood } from '../../data/characters';

const INK = '#3a2a22';
const S = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const };

// 形态 1 拉稀 → 2 硬条 → 3 三层经典 → 4/5 配饰。换正式插画只改这个文件。
export function Poo({ characterId, stage, size = 96, silhouette = false, mood = 'happy' }: { characterId: string; stage: number; size?: number; silhouette?: boolean; mood?: Mood }) {
  const def = charDef(characterId);
  const acc = new Set<Acc>([...(stage >= 4 ? def.acc4 : []), ...(stage >= 5 ? def.acc5 : [])]);
  const has = (a: Acc) => acc.has(a);
  const x = 50, y = stage === 1 ? 76 : stage === 2 ? 70 : 57; // 脸的位置
  const m: Mood = poseFor(def.id, stage) ?? mood;
  const mouthD = m === 'happy' ? `M${x - 5} ${y + 8} q5 6 10 0` : m === 'sleep' ? `M${x - 2} ${y + 9} q2 3 4 0`
    : m === 'dizzy' || m === 'nausea' ? `M${x - 6} ${y + 9} q3 -4 6 0 q3 4 6 0` : m === 'sad' ? `M${x - 4} ${y + 11} q4 -4 8 0` : `M${x - 4} ${y + 9} h8`;
  const lip = has('makeup') && m === 'happy';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${def.name} 形态${stage}`}
      style={silhouette ? { filter: 'brightness(0)' } : undefined}>
      {stage >= 5 && <circle cx="50" cy="58" r="46" fill={def.accent} opacity=".18" />}
      <g fill={def.tint} {...S}>
        {stage === 1 && <><path d="M10 82 Q8 68 26 68 Q30 54 46 58 Q56 44 70 58 Q92 58 91 77 Q93 91 70 91 L30 91 Q10 93 10 82Z" /><circle cx="80" cy="95" r="2.5" /></>}
        {stage === 2 && <><rect x="12" y="50" width="76" height="40" rx="20" /><path d="M30 54 q-3 16 0 32 M70 54 q3 16 0 32" fill="none" strokeWidth="2" /></>}
        {stage >= 3 && <>
          <ellipse cx="50" cy="77" rx="36" ry="17" /><ellipse cx="50" cy="57" rx="28" ry="15" />
          <ellipse cx="50" cy="39" rx="19" ry="12" /><ellipse cx="50" cy="26" rx="8" ry="7" />
          <ellipse cx="38" cy="49" rx="4" ry="1.8" fill="#fff" opacity=".35" stroke="none" />
        </>}
      </g>
      {/* 脸:表情由 mood 决定 */}
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round">
        {[-9, 9].map((dx) => {
          const ex = x + dx, sg = dx < 0 ? 1 : -1;
          if (has('shades')) return null;
          if (m === 'sleep') return <path key={dx} d={`M${ex - 4} ${y} q4 4 8 0`} />;
          if (m === 'speechless') return <path key={dx} d={`M${ex - 4} ${y} h8`} />;
          if (m === 'nausea') return <path key={dx} d={`M${ex - 4 * sg} ${y - 3} l${8 * sg} 3 l${-8 * sg} 3`} />;
          const px = m === 'think' ? 1.8 : 0.6, py = m === 'think' ? -1.6 : 0.6;
          return (
            <g key={dx}>
              <circle cx={ex} cy={y} r="4.8" fill="#fff" strokeWidth="1.5" />
              {m === 'dizzy' ? <path d={`M${ex} ${y} m-2 0 a2 2 0 1 1 2 2 a3.5 3.5 0 1 1 -3.5 -3.5`} strokeWidth="1.3" /> : (
                <><circle cx={ex + px} cy={y + py} r="2.7" fill={INK} stroke="none" /><circle cx={ex + px + 0.9} cy={y + py - 1.3} r="0.9" fill="#fff" stroke="none" /></>
              )}
              {has('makeup') && <path d={`M${ex + (dx < 0 ? -4 : 4)} ${y - 3} l${dx < 0 ? -3 : 3} -3`} />}
            </g>
          );
        })}
      </g>
      {has('shades') && <g fill="#1c1c28"><rect x={x - 16} y={y - 6} width="14" height="10" rx="3" /><rect x={x + 2} y={y - 6} width="14" height="10" rx="3" /><rect x={x - 3} y={y - 4} width="6" height="2" /></g>}
      {[-17, 17].map((dx) => <circle key={dx} cx={x + dx} cy={y + 6} r="3.2" fill={m === 'nausea' ? '#9acd6a' : '#ff8fa0'} opacity={has('makeup') ? 0.9 : 0.55} />)}
      <path d={mouthD} fill={lip ? '#e0394f' : 'none'} stroke={lip ? '#e0394f' : INK} strokeWidth="2.2" strokeLinecap="round" />
      {m === 'sleep' && <text x={x + 20} y={y - 12} fontSize="11" fontWeight="700" fill={INK}>z</text>}
      {m === 'think' && <g fill="#fff" stroke={INK} strokeWidth="1.2"><circle cx={x + 22} cy={y - 12} r="2" /><circle cx={x + 27} cy={y - 19} r="3" /></g>}
      {m === 'speechless' && <text x={x + 14} y={y - 10} fontSize="10" fill={INK}>…</text>}
      {m === 'sad' && <path d={`M${x - 14} ${y + 3} q-2 4 0 6 q2 -2 0 -6z`} fill="#7fc8f8" />}
      {/* 配饰 */}
      {has('leaf') && <path d="M50 20 q-3 -12 -15 -10 q2 11 15 10 q3 -12 15 -10 q-2 11 -15 10" fill="#6aa84f" stroke={INK} strokeWidth="2" />}
      {has('cap') && <g fill={def.accent} stroke={INK} strokeWidth="2"><path d="M38 24 q12 -16 24 0z" /><rect x="40" y="23" width="30" height="4" rx="2" /></g>}
      {has('crown') && <path d="M40 22 l2 -11 l8 6 l8 -6 l2 11z" fill="#f4c542" stroke={INK} strokeWidth="2" />}
      {has('flame') && <path d="M50 5 q13 11 0 21 q-13 -10 0 -21z" fill="#ff7a2f" stroke={INK} strokeWidth="2" />}
      {has('earring') && <g fill="#f4c542" stroke={INK} strokeWidth="1.2"><circle cx="22" cy={y + 7} r="3" /><circle cx="78" cy={y + 7} r="3" /></g>}
      {has('bandage') && <rect x="30" y="42" width="16" height="6" rx="2" transform="rotate(-25 38 45)" fill="#f6e7d0" stroke={INK} strokeWidth="1.5" />}
      {has('sweat') && <path d="M80 34 q5 7 0 10 q-5 -3 0 -10z" fill="#7fc8f8" stroke={INK} strokeWidth="1.5" />}
      {has('bubbles') && <g fill={def.accent} stroke={INK} strokeWidth="1.5" opacity=".85"><circle cx="18" cy="32" r="4" /><circle cx="84" cy="26" r="3" /><circle cx="74" cy="12" r="2.2" /></g>}
      {has('sparkle') && <g fill={def.accent}><circle cx="10" cy="22" r="3" /><circle cx="91" cy="46" r="2.5" /><circle cx="86" cy="10" r="2" /></g>}
    </svg>
  );
}
