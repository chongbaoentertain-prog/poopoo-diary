import type { Acc, Mood } from '../../data/characters';
import { INK } from './inkStyle';

/** 脸:表情由 mood 决定;戴墨镜 / 化妆会影响眼睛的画法 */
export function Face({ x, y, m, has }: { x: number; y: number; m: Mood; has: (a: Acc) => boolean }) {
  const mouthD = m === 'happy' ? `M${x - 5} ${y + 8} q5 6 10 0` : m === 'sleep' ? `M${x - 2} ${y + 9} q2 3 4 0`
    : m === 'dizzy' ? `M${x - 7} ${y + 7} q7 -4 14 0 q0 8 -7 8 q-7 0 -7 -8z` : m === 'nausea' ? `M${x - 5} ${y + 8} q5 -2 10 0 q1 7 -5 7 q-6 0 -5 -7z`
    : m === 'sad' ? `M${x - 5} ${y + 11} q5 -5 10 0` : m === 'speechless' ? `M${x - 4} ${y + 10} q4 -3 8 0` : `M${x - 4} ${y + 9} h8`;
  const lip = has('makeup') && m === 'happy';

  return (
    <>
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round">
        {[-9, 9].map((dx) => {
          const ex = x + dx, sg = dx < 0 ? 1 : -1;
          if (has('shades')) return null;
          if (m === 'sleep') return <path key={dx} d={`M${ex - 4} ${y} q4 4 8 0`} />;
          if (m === 'sad') return <path key={dx} d={`M${ex - 4 * sg} ${y + 2} l${8 * sg} -3`} strokeWidth="2.4" />; // 垂眼:内高外低
          if (m === 'dizzy') return <g key={dx}><path d={`M${ex - 5} ${y + 2} q5 -6 10 0`} strokeWidth="2.6" /><path d={`M${ex - 5 * sg} ${y - 4} l${10 * sg} -3`} strokeWidth="2" /></g>; // 😭:紧闭的眼 + 八字眉
          if (m === 'nausea') return <path key={dx} d={`M${ex - 4 * sg} ${y - 3} l${8 * sg} 3 l${-8 * sg} 3`} />;
          return (
            <g key={dx}>
              <circle cx={ex} cy={y} r="4.8" fill="#fff" strokeWidth="1.5" />
              <circle cx={ex + 0.6} cy={y + 0.6} r="2.7" fill={INK} stroke="none" /><circle cx={ex + 1.5} cy={y - 0.7} r="0.9" fill="#fff" stroke="none" />
              {m === 'speechless' && <path d={`M${ex - 6 * sg} ${y - 7} l${12 * sg} 4`} strokeWidth="2.4" />}
              {has('makeup') && <path d={`M${ex + (dx < 0 ? -4 : 4)} ${y - 3} l${dx < 0 ? -3 : 3} -3`} />}
            </g>
          );
        })}
      </g>
      {has('shades') && <g fill="#1c1c28"><rect x={x - 16} y={y - 6} width="14" height="10" rx="3" /><rect x={x + 2} y={y - 6} width="14" height="10" rx="3" /><rect x={x - 3} y={y - 4} width="6" height="2" /></g>}
      {[-17, 17].map((dx) => <circle key={dx} cx={x + dx} cy={y + 6} r={m === 'speechless' ? 5 : 3.2} fill={m === 'nausea' ? '#9acd6a' : '#ff8fa0'} opacity={has('makeup') ? 0.9 : 0.55} />)}
      <path d={mouthD} fill={m === 'nausea' || m === 'dizzy' ? '#6b2b2b' : lip ? '#e0394f' : 'none'} stroke={lip ? '#e0394f' : INK} strokeWidth="2.2" strokeLinecap="round" />
      {m === 'sleep' && <text x={x + 20} y={y - 12} fontSize="11" fontWeight="700" fill={INK}>z</text>}
      {m === 'speechless' && <path d={`M${x + 15} ${y - 20} l6 6 M${x + 21} ${y - 20} l-6 6`} stroke="#e0394f" strokeWidth="2.4" strokeLinecap="round" />}
      {m === 'dizzy' && <g fill="#7fc8f8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round">{[-9, 9].map((dx) => <path key={dx} d={`M${x + dx - 2} ${y + 4} q-5 9 -4 17 q9 2 10 -2 q-1 -9 -4 -15z`} />)}<ellipse cx={x} cy={y + 12} rx="4" ry="2.2" fill="#ff8fa0" stroke="none" /></g>}
      {m === 'sad' && <g><path d={`M${x - 8} ${y - 15} v5 M${x} ${y - 16} v6 M${x + 8} ${y - 15} v5`} stroke="#6c7a96" strokeWidth="2" strokeLinecap="round" fill="none" /><g fill="#fff" stroke={INK} strokeWidth="1.2"><circle cx={x + 11} cy={y + 14} r="2" /><circle cx={x + 16} cy={y + 11} r="2.8" /><circle cx={x + 22} cy={y + 8} r="3.6" /></g></g>}
      {m === 'nausea' && <g fill="#9acd6a" stroke={INK} strokeWidth="1.5"><path d={`M${x + 4} ${y + 11} q10 -2 16 4 q3 4 -1 7 q-8 -1 -15 -4z`} /><circle cx={x + 24} cy={y + 20} r="2" /><circle cx={x + 18} cy={y + 24} r="1.6" /></g>}
    </>
  );
}
