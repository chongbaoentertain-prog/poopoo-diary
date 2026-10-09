import { INK_COLOR } from '../inkStyle';

/** 多个角色共用的小件。坐标都是 100×100 画布上的位置。 */

const SPOKE_ANGLES_6 = [0, 60, 120, 180, 240, 300];
const SPOKE_ANGLES_3 = [0, 60, 120];
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const Coin = ({ x, y, radius = 5 }: { x: number; y: number; radius?: number }) => (
  <g>
    <circle cx={x} cy={y} r={radius} fill="#f4c542" stroke={INK_COLOR} strokeWidth="1.5" />
    <circle cx={x} cy={y} r={radius * 0.6} fill="none" stroke="#c8921a" strokeWidth="1" />
  </g>
);

/** 四角星 */
export const Spark = ({ x, y, radius = 4, fill = '#fff3a8' }: { x: number; y: number; radius?: number; fill?: string }) => (
  <path
    d={`M${x} ${y - radius} l${radius * 0.3} ${radius * 0.7} l${radius * 0.7} ${radius * 0.3} l${-radius * 0.7} ${radius * 0.3} l${-radius * 0.3} ${radius * 0.7} l${-radius * 0.3} ${-radius * 0.7} l${-radius * 0.7} ${-radius * 0.3} l${radius * 0.7} ${-radius * 0.3}z`}
    fill={fill} stroke={INK_COLOR} strokeWidth="1" strokeLinejoin="round"
  />
);

export const Bubble = ({ x, y, radius, opacity = 0.5 }: { x: number; y: number; radius: number; opacity?: number }) => (
  <g>
    <circle cx={x} cy={y} r={radius} fill="#bfe3ff" fillOpacity={opacity} stroke="#4aa3df" strokeWidth="1.5" />
    <path d={`M${x - radius * 0.55} ${y - radius * 0.1} q0 ${-radius * 0.5} ${radius * 0.5} ${-radius * 0.55}`} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </g>
);

export const Flame = ({ x, y, scale = 1, fill = '#e5483b' }: { x: number; y: number; scale?: number; fill?: string }) => (
  <path
    transform={`translate(${x} ${y}) scale(${scale})`}
    d="M0 0 C-10 -6 -8 -18 -2 -26 C-1 -18 4 -16 5 -22 C13 -12 12 -4 8 0z"
    fill={fill} stroke={INK_COLOR} strokeWidth={1.4 / scale} strokeLinejoin="round"
  />
);

export const Mushroom = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK_COLOR} strokeWidth={1.5 / scale} strokeLinejoin="round">
    <rect x="-3" y="-8" width="6" height="8" rx="2" fill="#f6e7d0" />
    <path d="M-9 -7 Q0 -22 9 -7z" fill="#d9433a" />
    <g fill="#fff" stroke="none"><circle cx="-3" cy="-12" r="1.6" /><circle cx="3" cy="-10" r="1.3" /></g>
  </g>
);

export const Gem = ({ x, y, scale = 1, fill = '#6fd3e8' }: { x: number; y: number; scale?: number; fill?: string }) => (
  <path
    transform={`translate(${x} ${y}) scale(${scale})`}
    d="M-6 -6 L-3 -11 L3 -11 L6 -6 L0 2z M-6 -6 H6"
    fill={fill} stroke={INK_COLOR} strokeWidth={1.4 / scale} strokeLinejoin="round"
  />
);

export const Germ = ({ x, y, radius = 4 }: { x: number; y: number; radius?: number }) => (
  <g stroke="#5f8f3a" strokeWidth="1.6" strokeLinecap="round">
    {SPOKE_ANGLES_6.map((angle) => (
      <line key={angle} x1={x} y1={y} x2={x + Math.cos(toRadians(angle)) * (radius + 3)} y2={y + Math.sin(toRadians(angle)) * (radius + 3)} />
    ))}
    <circle cx={x} cy={y} r={radius} fill="#9acd6a" stroke={INK_COLOR} strokeWidth="1.2" />
  </g>
);

export const Snowflake = ({ x, y, radius = 4 }: { x: number; y: number; radius?: number }) => (
  <g stroke="#7ab8e6" strokeWidth="1.5" strokeLinecap="round">
    {SPOKE_ANGLES_3.map((angle) => (
      <line
        key={angle}
        x1={x - Math.cos(toRadians(angle)) * radius} y1={y - Math.sin(toRadians(angle)) * radius}
        x2={x + Math.cos(toRadians(angle)) * radius} y2={y + Math.sin(toRadians(angle)) * radius}
      />
    ))}
  </g>
);
