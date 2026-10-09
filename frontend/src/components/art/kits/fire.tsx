import { INK } from '../ink';
import { Flame, Spark } from './parts';
import type { Kit } from './types';

const L = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const burst = (x: number, y: number, r: number, c: string) => (
  <g stroke={c} strokeWidth="2.2" strokeLinecap="round" fill={c}>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const dx = Math.cos((a * Math.PI) / 180), dy = Math.sin((a * Math.PI) / 180);
      return <g key={a}><line x1={x + dx * r * 0.45} y1={y + dy * r * 0.45} x2={x + dx * r * 0.85} y2={y + dy * r * 0.85} /><circle cx={x + dx * r} cy={y + dy * r} r="1.6" stroke="none" /></g>;
    })}
  </g>
);

const smoke = (x: number, y: number, r: number) => <circle cx={x} cy={y} r={r} fill="#d8d8de" opacity=".7" />;

export const fireKits: Record<string, Kit> = {
  // 辣椒噗:红辣椒 + 两侧烈焰
  'fire-chili': {
    prop: (
      <g {...L}><path d="M16 3 C22 2 22 2 22 2 C21 7 20 10 19 12 C14 20 8 24 3 27 C3 19 8 13 12 9 C14 7 15 5 16 3z" fill="#e5483b" /><path d="M16 3 q4 -3 8 -2" fill="none" stroke="#3f7a3b" strokeWidth="2.6" /></g>
    ),
    scene: <g><Flame x={10} y={100} s={2.4} /><Flame x={10} y={100} s={1.5} fill="#ff9a2f" /><Flame x={90} y={100} s={2.6} /><Flame x={90} y={100} s={1.6} fill="#ff9a2f" /><Flame x={20} y={60} s={1} fill="#ff9a2f" /><Flame x={80} y={52} s={1} fill="#ff9a2f" /></g>,
  },
  // 炭烧噗:烤串 + 烤架炭火 + 烟
  'fire-grill': {
    prop: (
      <g {...L}><line x1="4" y1="27" x2="20" y2="2" strokeWidth="2" /><g fill="#b5562b" strokeWidth="1.5"><circle cx="9" cy="20" r="3.8" /><circle cx="13" cy="13" r="3.8" /><circle cx="17" cy="6.5" r="3.8" /></g></g>
    ),
    scene: <g>{smoke(12, 26, 7)}{smoke(22, 14, 5)}{smoke(8, 10, 4)}{smoke(88, 20, 6)}{smoke(80, 8, 4)}<circle cx="94" cy="44" r="2" fill="#ff9a2f" /><circle cx="6" cy="46" r="2" fill="#ff9a2f" /></g>,
    front: (
      <g>
        <ellipse cx="14" cy="98" rx="14" ry="5" fill="#e5483b" /><ellipse cx="50" cy="99" rx="26" ry="4" fill="#ff9a2f" /><ellipse cx="86" cy="98" rx="14" ry="5" fill="#e5483b" />
        <g stroke="#2a2a33" strokeWidth="2.2" strokeLinecap="round"><line x1="0" y1="90" x2="100" y2="90" />{[8, 24, 40, 56, 72, 88].map((x) => <line key={x} x1={x} y1="90" x2={x} y2="97" />)}</g>
      </g>
    ),
  },
  // 烟花噗:烟花棒 + 夜空烟花
  'fire-firework': {
    prop: (
      <g {...L}><line x1="6" y1="27" x2="14" y2="11" strokeWidth="2.2" /><g stroke="#f4c542" strokeWidth="2" strokeLinecap="round">{[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1="14" y1="9" x2={14 + Math.cos((a * Math.PI) / 180) * 7} y2={9 + Math.sin((a * Math.PI) / 180) * 7} />)}</g></g>
    ),
    scene: <g>{burst(16, 18, 14, '#e5483b')}{burst(84, 14, 12, '#4aa3df')}{burst(90, 50, 9, '#b45cf0')}{burst(8, 52, 7, '#f4c542')}<Spark x={34} y={8} r={3} /></g>,
  },
};
