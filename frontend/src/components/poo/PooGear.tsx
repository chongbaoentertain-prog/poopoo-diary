import type { Acc } from '../../data/characters';
import { INK } from './inkStyle';

const W = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const };

/**
 * 形态 4/5 的配饰。坐标按形态 3 及以上的身体(脸中心 50,57;头顶 y≈20)写死。
 * 画在脸之上:帽子 / 口罩 / 眼罩 都可以直接盖住脸的一部分。
 */
export function Gear({ has, accent }: { has: (a: Acc) => boolean; accent: string }) {
  return (
    <>
      {has('leaf') && <path d="M50 20 q-3 -12 -15 -10 q2 11 15 10 q3 -12 15 -10 q-2 11 -15 10" fill="#6aa84f" {...W} />}
      {has('cap') && <g fill={accent} {...W}><path d="M38 24 q12 -16 24 0z" /><rect x="40" y="23" width="30" height="4" rx="2" /></g>}
      {has('crown') && <path d="M40 22 l2 -11 l8 6 l8 -6 l2 11z" fill="#f4c542" {...W} />}
      {has('flame') && <path d="M50 5 q13 11 0 21 q-13 -10 0 -21z" fill="#ff7a2f" {...W} />}
      {has('mushroom') && <g {...W}><path d="M32 28 Q50 -4 68 28 Q50 22 32 28z" fill="#d9433a" /><g fill="#fff" stroke="none"><circle cx="43" cy="15" r="3" /><circle cx="55" cy="10" r="2.6" /><circle cx="61" cy="21" r="2.2" /></g></g>}
      {has('flowers') && <g {...W} strokeWidth={1.4}>{[[37, 26, '#ff8fa0'], [45, 21, '#fff'], [55, 21, '#f4c542'], [63, 26, '#ff8fa0']].map(([cx, cy, c]) => <g key={cx as number}><circle cx={cx as number} cy={cy as number} r="4" fill={c as string} /><circle cx={cx as number} cy={cy as number} r="1.5" fill="#f4c542" stroke="none" /></g>)}</g>}
      {has('pirate') && <g><path d="M30 27 Q50 0 70 27 Q50 20 30 27z" fill="#2a2a33" {...W} /><circle cx="50" cy="16" r="2.6" fill="#fff" /><path d="M35 53 L48 50" stroke="#1c1c28" strokeWidth="2" /><circle cx="41" cy="57" r="6" fill="#1c1c28" /></g>}
      {has('chef') && <path d="M38 27 v-5 q-8 -3 -4 -11 q6 -6 12 -2 q4 -7 12 0 q6 -4 12 2 q4 8 -4 11 v5z" fill="#fff" {...W} />}
      {has('party') && <g {...W}><path d="M40 27 L50 3 L60 27z" fill="#ff6fa5" /><path d="M44 18 l12 0 M42 23 l16 0" stroke="#fff" /><circle cx="50" cy="3" r="3.2" fill="#f4c542" /></g>}
      {has('hardhat') && <g {...W}><path d="M34 27 Q50 2 66 27z" fill="#f4c542" /><path d="M31 26 h38 v4 h-38z" fill="#e0a82e" /><circle cx="50" cy="14" r="3.4" fill="#fff" /></g>}
      {has('turban') && <g {...W}><ellipse cx="50" cy="21" rx="17" ry="9" fill="#efe6d2" /><path d="M36 20 q14 8 28 -2 M38 26 q12 4 24 -2" fill="none" strokeWidth="1.4" /><circle cx="50" cy="19" r="2.8" fill="#d9433a" /></g>}
      {has('tie') && <g {...W}><path d="M45 69 h10 l-2 4 l4 13 l-7 4 l-7 -4 l4 -13z" fill="#c0392b" /></g>}
      {has('mask') && <g {...W}><path d="M36 61 Q50 57 64 61 L63 73 Q50 79 37 73z" fill="#e8f4fa" /><path d="M39 66 h22 M39 70 h22" fill="none" strokeWidth="1.2" /><path d="M36 63 q-6 3 -7 9 M64 63 q6 3 7 9" fill="none" /></g>}
      {has('goggles') && <g {...W}><path d="M34 40 Q50 36 66 40" fill="none" strokeWidth="3" /><circle cx="43" cy="40" r="5.5" fill="#bfe3ff" /><circle cx="57" cy="40" r="5.5" fill="#bfe3ff" /></g>}
      {has('horns') && <g fill="#e5483b" {...W}><path d="M41 26 q-8 -3 -6 -15 q9 3 11 13z" /><path d="M59 26 q8 -3 6 -15 q-9 3 -11 13z" /></g>}
      {has('eyebags') && <g fill="none" stroke="#6c5a7a" strokeWidth="2" strokeLinecap="round"><path d="M37 63 q4 3 8 0" /><path d="M55 63 q4 3 8 0" /></g>}
      {has('spiderlegs') && <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round">{[0, 1].map((s) => <path key={s} transform={s ? 'translate(100 0) scale(-1 1)' : undefined} d="M24 50 q-10 -8 -15 3 M22 58 q-12 -3 -13 9 M23 66 q-10 2 -9 12" />)}</g>}
      {has('earring') && <g fill="#f4c542" stroke={INK} strokeWidth="1.2"><circle cx="22" cy="64" r="3" /><circle cx="78" cy="64" r="3" /></g>}
      {has('bandage') && <rect x="30" y="42" width="16" height="6" rx="2" transform="rotate(-25 38 45)" fill="#f6e7d0" stroke={INK} strokeWidth="1.5" />}
      {has('sweat') && <path d="M80 34 q5 7 0 10 q-5 -3 0 -10z" fill="#7fc8f8" stroke={INK} strokeWidth="1.5" />}
      {has('bubbles') && <g fill={accent} stroke={INK} strokeWidth="1.5" opacity=".85"><circle cx="18" cy="32" r="4" /><circle cx="84" cy="26" r="3" /><circle cx="74" cy="12" r="2.2" /></g>}
      {has('sparkle') && <g fill={accent}><circle cx="10" cy="22" r="3" /><circle cx="91" cy="46" r="2.5" /><circle cx="86" cy="10" r="2" /></g>}
    </>
  );
}
