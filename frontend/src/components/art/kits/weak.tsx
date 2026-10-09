import { INK } from '../ink';
import { Germ, Spark } from './parts';
import type { Kit } from './types';

const L = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const paperStack = (x: number, y: number, n: number) => (
  <g fill="#fff" stroke={INK} strokeWidth="1.4" strokeLinejoin="round">
    {Array.from({ length: n }, (_, i) => <g key={i}><rect x={x + (i % 2)} y={y - (i + 1) * 7} width="24" height="7" rx="1" /><path d={`M${x + 4} ${y - i * 7 - 3.5} h10`} stroke="#9aa7b5" strokeWidth="1.2" fill="none" /></g>)}
  </g>
);

const sheet = (x: number, y: number, a: number) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}><rect x="-6" y="-8" width="12" height="16" rx="1" fill="#fff" stroke={INK} strokeWidth="1.3" /><path d="M-3 -3 h6 M-3 1 h6 M-3 5 h4" stroke="#9aa7b5" strokeWidth="1.1" fill="none" /></g>
);

const star = (x: number, y: number, r = 3) => <Spark x={x} y={y} r={r} fill="#fff3a8" />;

export const weakKits: Record<string, Kit> = {
  // 社畜噗:公事包 + 办公室挂钟、满天文件、文件山
  'weak-worker': {
    prop: (
      <g {...L}><path d="M8 11 v-4 h8 v4" fill="none" strokeWidth="2" /><rect x="2" y="10" width="20" height="15" rx="2" fill="#5b4636" /><path d="M2 17 h20" strokeWidth="1.4" /><rect x="10" y="15" width="4" height="4" rx="1" fill="#f4c542" strokeWidth="1.2" /></g>
    ),
    scene: (
      <g>
        <g {...L}><circle cx="16" cy="18" r="11" fill="#fff" /><path d="M16 18 V11 M16 18 L21 20" fill="none" strokeWidth="2" strokeLinecap="round" /></g>
        {sheet(82, 15, 20)}{sheet(89, 35, -15)}{sheet(69, 8, -25)}
      </g>
    ),
    front: <g>{paperStack(0, 100, 4)}{paperStack(74, 100, 5)}</g>,
  },
  // 熬夜噗:咖啡 + 月亮星星
  'weak-nightowl': {
    prop: (
      <g {...L}><path d="M4 11 h14 v9 q0 6 -7 6 q-7 0 -7 -6z" fill="#fff" /><path d="M18 14 q5 0 4 4 q-1 3 -4 3" fill="none" /><ellipse cx="11" cy="11" rx="7" ry="1.8" fill="#6b4a2f" strokeWidth="1.2" /><path d="M8 8 q-2 -3 0 -5 M13 8 q-2 -3 0 -5" fill="none" stroke="#9aa7b5" strokeWidth="1.6" strokeLinecap="round" /></g>
    ),
    scene: (
      <g>
        <path d="M82 6 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22z" fill="#ffe28a" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        {star(14, 14, 4)}{star(30, 6, 3)}{star(8, 38, 3)}{star(94, 50, 3)}{star(70, 22, 2.5)}
        <text x="18" y="46" fontSize="11" fontWeight="700" fill={INK} opacity=".7">z</text>
      </g>
    ),
  },
  // 感冒噗:纸巾盒 + 病菌 + 纸巾团
  'weak-cold': {
    prop: (
      <g {...L}><path d="M9 12 q3 -9 6 0" fill="#fff" /><rect x="3" y="12" width="18" height="13" rx="2" fill="#bfe3ff" /><ellipse cx="12" cy="17" rx="5" ry="1.8" fill="#fff" strokeWidth="1.2" /></g>
    ),
    scene: <g><Germ x={14} y={14} r={5} /><Germ x={30} y={6} r={3} /><Germ x={88} y={16} r={5} /><Germ x={94} y={42} r={3.5} /><Germ x={6} y={46} r={3.5} /></g>,
    front: <g fill="#fff" stroke={INK} strokeWidth="1.5"><circle cx="10" cy="95" r="7" /><circle cx="22" cy="98" r="5" /><circle cx="90" cy="95" r="7.5" /><circle cx="78" cy="98" r="4.5" /></g>,
  },
};
