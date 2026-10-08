import { INK } from '../ink';
import { Mushroom, Spark } from './parts';
import type { Kit } from './types';

const L = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

/** 一根竹子:x 为左边缘,贯穿整个画布 */
const stalk = (x: number, w = 7, leaves = true) => (
  <g {...L}>
    <rect x={x} y="-2" width={w} height="104" rx={w / 2} fill="#6aa84f" />
    {[20, 46, 72].map((y) => <line key={y} x1={x} y1={y} x2={x + w} y2={y} stroke="#3f6b2f" strokeWidth="1.6" />)}
    {leaves && <path d={`M${x + w} 32 q10 -2 12 -9 q-10 -1 -12 9z M${x} 58 q-10 -2 -12 -9 q10 -1 12 9z`} fill="#8bc66a" strokeWidth="1.4" />}
  </g>
);

const flower = (x: number, y: number, c: string, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={1.4 / s} strokeLinejoin="round">
    <path d="M0 0 V12" fill="none" stroke="#3f7a3b" strokeWidth="1.8" />
    {[[0, -4], [4, -1], [-4, -1], [2.5, 3], [-2.5, 3]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={dx} cy={dy} r="3.2" fill={c} />)}
    <circle r="2.4" fill="#f4c542" />
  </g>
);

const butterfly = (x: number, y: number, c: string) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
    <path d="M0 0 q-8 -9 -9 -2 q0 6 9 2z M0 0 q8 -9 9 -2 q0 6 -9 2z" fill={c} /><path d="M0 -1 v6" />
  </g>
);

const firefly = (x: number, y: number) => (
  <g><circle cx={x} cy={y} r="5" fill="#fff3a8" opacity=".45" /><circle cx={x} cy={y} r="2" fill="#f4c542" /></g>
);

export const woodKits: Record<string, Kit> = {
  // 竹子噗:竹笋/竹子 + 满屏竹林
  'wood-bamboo': {
    prop: (
      <g {...L}><rect x="9" y="2" width="6" height="24" rx="3" fill="#6aa84f" /><line x1="9" y1="10" x2="15" y2="10" stroke="#3f6b2f" /><line x1="9" y1="19" x2="15" y2="19" stroke="#3f6b2f" /><path d="M15 9 q8 -2 8 -7 q-8 0 -8 7z" fill="#8bc66a" /></g>
    ),
    scene: <g>{stalk(2)}{stalk(13, 6, false)}{stalk(81, 6, false)}{stalk(91)}</g>,
  },
  // 蘑菇噗:小蘑菇 + 森林萤火虫
  'wood-mushroom': {
    prop: <Mushroom x={12} y={26} s={1.15} />,
    scene: <g>{firefly(14, 14)}{firefly(30, 6)}{firefly(86, 18)}{firefly(94, 40)}{firefly(8, 44)}</g>,
    front: <g><Mushroom x={9} y={98} s={1.2} /><Mushroom x={22} y={100} s={0.8} /><Mushroom x={91} y={98} s={1.3} /><Mushroom x={78} y={100} s={0.8} /></g>,
  },
  // 花花噗:花 + 蝴蝶花田
  'wood-flower': {
    prop: flower(12, 12, '#ff8fa0', 1.25),
    scene: <g>{butterfly(14, 14, '#f4a6d7')}{butterfly(30, 30, '#ffd966')}{butterfly(86, 12, '#8ed1ff')}<Spark x={92} y={34} r={3} /></g>,
    front: <g>{flower(6, 86, '#ff8fa0', 1.1)}{flower(18, 90, '#fff', 0.9)}{flower(30, 94, '#f4a6d7', 0.8)}{flower(94, 86, '#ffd966', 1.1)}{flower(82, 90, '#ff8fa0', 0.9)}{flower(70, 94, '#fff', 0.8)}</g>,
  },
};
