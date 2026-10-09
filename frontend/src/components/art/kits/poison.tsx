import { INK } from '../ink';
import type { Kit } from './types';

const L = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const mist = (x: number, y: number, r: number) => <circle cx={x} cy={y} r={r} fill="#b45cf0" opacity=".25" />;

/** 从顶部垂下的蛇 */
const hangingSnake = (x: number, len: number, dir: 1 | -1) => (
  <g fill="none" strokeLinecap="round">
    <path d={`M${x} -2 q${12 * dir} ${len * 0.25} 0 ${len * 0.5} q${-12 * dir} ${len * 0.25} 0 ${len * 0.5}`} stroke={INK} strokeWidth="7" />
    <path d={`M${x} -2 q${12 * dir} ${len * 0.25} 0 ${len * 0.5} q${-12 * dir} ${len * 0.25} 0 ${len * 0.5}`} stroke="#7bbf4a" strokeWidth="4.2" />
    <circle cx={x} cy={len} r="4.4" fill="#7bbf4a" stroke={INK} strokeWidth="1.6" /><circle cx={x - 1.5} cy={len - 1} r=".9" fill={INK} stroke="none" /><circle cx={x + 1.5} cy={len - 1} r=".9" fill={INK} stroke="none" />
    <path d={`M${x} ${len + 4} v4 m0 0 l-1.5 2 m1.5 -2 l1.5 2`} stroke="#e0394f" strokeWidth="1.2" />
  </g>
);

const flask = (x: number, y: number, s: number, c: string) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={1.8 / s} strokeLinejoin="round">
    <path d="M9 3 h6 v7 L21 22 Q22 27 17 27 H7 Q2 27 3 22 L9 10z" fill="#e6dcf7" fillOpacity=".8" />
    <path d="M5 19 H19 L21 22 Q22 27 17 27 H7 Q2 27 3 22z" fill={c} /><rect x="8.5" y="0" width="7" height="3.5" rx="1" fill="#8a5a2c" />
  </g>
);

const web = (flip: number) => (
  <g transform={flip < 0 ? 'translate(100 0) scale(-1 1)' : undefined} fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity=".95">
    <path d="M0 0 L34 0 M0 0 L30 22 M0 0 L16 34 M0 0 L0 38" stroke={INK} strokeWidth="1.2" />
    <path d="M12 0 Q10 12 0 14 M24 0 Q20 18 0 26 M32 0 Q27 24 0 36" stroke={INK} strokeWidth="1.1" />
  </g>
);

export const poisonKits: Record<string, Kit> = {
  // 毒蛇噗:盘蛇 + 垂蛇与毒雾
  'poison-snake': {
    prop: (
      <g fill="none" strokeLinecap="round">
        <path d="M4 25 Q4 19 12 21 Q20 23 20 15 Q20 9 12 10" stroke={INK} strokeWidth="7.5" /><path d="M4 25 Q4 19 12 21 Q20 23 20 15 Q20 9 12 10" stroke="#7bbf4a" strokeWidth="4.6" />
        <circle cx="10" cy="8" r="4.2" fill="#7bbf4a" stroke={INK} strokeWidth="1.5" /><path d="M10 3.8 v-3" stroke="#e0394f" strokeWidth="1.2" />
      </g>
    ),
    scene: <g>{mist(10, 60, 16)}{mist(92, 50, 14)}{mist(20, 40, 10)}{hangingSnake(12, 34, 1)}{hangingSnake(88, 28, -1)}</g>,
  },
  // 药剂噗:药瓶 + 咕嘟冒泡
  'poison-potion': {
    prop: <g>{flask(0, 0, 1, '#9b59d0')}</g>,
    scene: (
      <g fill="#c58cf0" stroke={INK} strokeWidth="1.3">
        <circle cx="14" cy="16" r="5" /><circle cx="26" cy="8" r="3" /><circle cx="88" cy="14" r="4.5" /><circle cx="94" cy="32" r="3" fill="#9acd6a" /><circle cx="8" cy="38" r="3.5" fill="#9acd6a" />
      </g>
    ),
    front: <g>{flask(0, 74, 0.9, '#7be39a')}{flask(78, 72, 1, '#9b59d0')}</g>,
  },
  // 蜘蛛噗:垂吊蜘蛛 + 蛛网
  'poison-spider': {
    prop: (
      <g stroke={INK} strokeLinecap="round">
        <path d="M12 -14 V9" strokeWidth="1" /><g fill="none" strokeWidth="1.4">{[-1, 1].flatMap((s) => [[-8, 5], [-10, 11], [-8, 17], [-5, 22]].map(([dx, dy]) => <path key={`${s}${dx}${dy}`} d={`M12 15 L${12 + s * Math.abs(dx)} ${dy + 8}`} />))}</g>
        <circle cx="12" cy="17" r="5.5" fill="#3a2a3a" strokeWidth="1.6" /><circle cx="12" cy="11" r="3.4" fill="#3a2a3a" strokeWidth="1.4" /><circle cx="10.8" cy="10.4" r=".8" fill="#e0394f" stroke="none" /><circle cx="13.2" cy="10.4" r=".8" fill="#e0394f" stroke="none" />
      </g>
    ),
    scene: <g>{web(1)}{web(-1)}<circle cx="86" cy="52" r="3" fill="#3a2a3a" /><path d="M86 38 V50" stroke={INK} strokeWidth="1" /></g>,
  },
};
