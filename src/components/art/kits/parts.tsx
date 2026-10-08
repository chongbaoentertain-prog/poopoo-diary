import { INK } from '../ink';

/** 多个角色共用的小件。坐标都是 100×100 画布上的位置。 */

export const Coin = ({ x, y, r = 5 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill="#f4c542" stroke={INK} strokeWidth="1.5" /><circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="#c8921a" strokeWidth="1" /></g>
);

/** 四角星 */
export const Spark = ({ x, y, r = 4, fill = '#fff3a8' }: { x: number; y: number; r?: number; fill?: string }) => (
  <path d={`M${x} ${y - r} l${r * 0.3} ${r * 0.7} l${r * 0.7} ${r * 0.3} l${-r * 0.7} ${r * 0.3} l${-r * 0.3} ${r * 0.7} l${-r * 0.3} ${-r * 0.7} l${-r * 0.7} ${-r * 0.3} l${r * 0.7} ${-r * 0.3}z`}
    fill={fill} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
);

export const Bubble = ({ x, y, r, o = 0.5 }: { x: number; y: number; r: number; o?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill="#bfe3ff" fillOpacity={o} stroke="#4aa3df" strokeWidth="1.5" />
    <path d={`M${x - r * 0.55} ${y - r * 0.1} q0 ${-r * 0.5} ${r * 0.5} ${-r * 0.55}`} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></g>
);

export const Flame = ({ x, y, s = 1, fill = '#e5483b' }: { x: number; y: number; s?: number; fill?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 0 C-10 -6 -8 -18 -2 -26 C-1 -18 4 -16 5 -22 C13 -12 12 -4 8 0z" fill={fill} stroke={INK} strokeWidth={1.4 / s} strokeLinejoin="round" />
);

export const Mushroom = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={1.5 / s} strokeLinejoin="round">
    <rect x="-3" y="-8" width="6" height="8" rx="2" fill="#f6e7d0" /><path d="M-9 -7 Q0 -22 9 -7z" fill="#d9433a" />
    <g fill="#fff" stroke="none"><circle cx="-3" cy="-12" r="1.6" /><circle cx="3" cy="-10" r="1.3" /></g>
  </g>
);

export const Gem = ({ x, y, s = 1, fill = '#6fd3e8' }: { x: number; y: number; s?: number; fill?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M-6 -6 L-3 -11 L3 -11 L6 -6 L0 2z M-6 -6 H6" fill={fill} stroke={INK} strokeWidth={1.4 / s} strokeLinejoin="round" />
);

export const Germ = ({ x, y, r = 4 }: { x: number; y: number; r?: number }) => (
  <g stroke="#5f8f3a" strokeWidth="1.6" strokeLinecap="round">
    {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={x} y1={y} x2={x + Math.cos((a * Math.PI) / 180) * (r + 3)} y2={y + Math.sin((a * Math.PI) / 180) * (r + 3)} />)}
    <circle cx={x} cy={y} r={r} fill="#9acd6a" stroke={INK} strokeWidth="1.2" />
  </g>
);

export const Snow = ({ x, y, r = 4 }: { x: number; y: number; r?: number }) => (
  <g stroke="#7ab8e6" strokeWidth="1.5" strokeLinecap="round">
    {[0, 60, 120].map((a) => <line key={a} x1={x - Math.cos((a * Math.PI) / 180) * r} y1={y - Math.sin((a * Math.PI) / 180) * r} x2={x + Math.cos((a * Math.PI) / 180) * r} y2={y + Math.sin((a * Math.PI) / 180) * r} />)}
  </g>
);
