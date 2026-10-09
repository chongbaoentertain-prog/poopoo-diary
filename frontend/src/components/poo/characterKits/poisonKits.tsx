import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';

// 蜘蛛每侧四条腿的末端:离身体中心的水平距离,和纵坐标
const SPIDER_LEG_ENDS = [
  { distanceX: 8, endY: 13 },
  { distanceX: 10, endY: 19 },
  { distanceX: 8, endY: 25 },
  { distanceX: 5, endY: 30 },
];

const PoisonMist = ({ x, y, radius }: { x: number; y: number; radius: number }) => (
  <circle cx={x} cy={y} r={radius} fill="#b45cf0" opacity=".25" />
);

/** 从画布顶部垂下的蛇。curveDirection 决定身体先往哪边弯 */
const HangingSnake = ({ x, length, curveDirection }: { x: number; length: number; curveDirection: 1 | -1 }) => {
  const bodyPath = `M${x} -2 q${12 * curveDirection} ${length * 0.25} 0 ${length * 0.5} q${-12 * curveDirection} ${length * 0.25} 0 ${length * 0.5}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={bodyPath} stroke={INK_COLOR} strokeWidth="7" />
      <path d={bodyPath} stroke="#7bbf4a" strokeWidth="4.2" />
      <circle cx={x} cy={length} r="4.4" fill="#7bbf4a" stroke={INK_COLOR} strokeWidth="1.6" />
      <circle cx={x - 1.5} cy={length - 1} r=".9" fill={INK_COLOR} stroke="none" />
      <circle cx={x + 1.5} cy={length - 1} r=".9" fill={INK_COLOR} stroke="none" />
      <path d={`M${x} ${length + 4} v4 m0 0 l-1.5 2 m1.5 -2 l1.5 2`} stroke="#e0394f" strokeWidth="1.2" />
    </g>
  );
};

const PotionFlask = ({ x, y, scale, liquidColor }: { x: number; y: number; scale: number; liquidColor: string }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK_COLOR} strokeWidth={1.8 / scale} strokeLinejoin="round">
    <path d="M9 3 h6 v7 L21 22 Q22 27 17 27 H7 Q2 27 3 22 L9 10z" fill="#e6dcf7" fillOpacity=".8" />
    <path d="M5 19 H19 L21 22 Q22 27 17 27 H7 Q2 27 3 22z" fill={liquidColor} />
    <rect x="8.5" y="0" width="7" height="3.5" rx="1" fill="#8a5a2c" />
  </g>
);

/** 画布顶角的蛛网。isMirrored 为 true 时放到右上角 */
const SpiderWeb = ({ isMirrored = false }: { isMirrored?: boolean }) => (
  <g transform={isMirrored ? 'translate(100 0) scale(-1 1)' : undefined} fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity=".95">
    <path d="M0 0 L34 0 M0 0 L30 22 M0 0 L16 34 M0 0 L0 38" stroke={INK_COLOR} strokeWidth="1.2" />
    <path d="M12 0 Q10 12 0 14 M24 0 Q20 18 0 26 M32 0 Q27 24 0 36" stroke={INK_COLOR} strokeWidth="1.1" />
  </g>
);

export const poisonKits: Record<string, CharacterKit> = {
  // 毒蛇噗:盘蛇 + 垂蛇与毒雾
  'poison-snake': {
    prop: (
      <g fill="none" strokeLinecap="round">
        <path d="M4 25 Q4 19 12 21 Q20 23 20 15 Q20 9 12 10" stroke={INK_COLOR} strokeWidth="7.5" />
        <path d="M4 25 Q4 19 12 21 Q20 23 20 15 Q20 9 12 10" stroke="#7bbf4a" strokeWidth="4.6" />
        <circle cx="10" cy="8" r="4.2" fill="#7bbf4a" stroke={INK_COLOR} strokeWidth="1.5" />
        <path d="M10 3.8 v-3" stroke="#e0394f" strokeWidth="1.2" />
      </g>
    ),
    scene: (
      <g>
        <PoisonMist x={10} y={60} radius={16} /><PoisonMist x={92} y={50} radius={14} /><PoisonMist x={20} y={40} radius={10} />
        <HangingSnake x={12} length={34} curveDirection={1} /><HangingSnake x={88} length={28} curveDirection={-1} />
      </g>
    ),
  },
  // 药剂噗:药瓶 + 咕嘟冒泡
  'poison-potion': {
    prop: <g><PotionFlask x={0} y={0} scale={1} liquidColor="#9b59d0" /></g>,
    scene: (
      <g fill="#c58cf0" stroke={INK_COLOR} strokeWidth="1.3">
        <circle cx="14" cy="16" r="5" /><circle cx="26" cy="8" r="3" /><circle cx="88" cy="14" r="4.5" />
        <circle cx="94" cy="32" r="3" fill="#9acd6a" /><circle cx="8" cy="38" r="3.5" fill="#9acd6a" />
      </g>
    ),
    foreground: (
      <g>
        <PotionFlask x={0} y={74} scale={0.9} liquidColor="#7be39a" /><PotionFlask x={78} y={72} scale={1} liquidColor="#9b59d0" />
      </g>
    ),
  },
  // 蜘蛛噗:垂吊蜘蛛 + 蛛网
  'poison-spider': {
    prop: (
      <g stroke={INK_COLOR} strokeLinecap="round">
        <path d="M12 -14 V9" strokeWidth="1" />
        <g fill="none" strokeWidth="1.4">
          {[-1, 1].flatMap((side) => SPIDER_LEG_ENDS.map(({ distanceX, endY }) => (
            <path key={`${side}${distanceX}${endY}`} d={`M12 15 L${12 + side * distanceX} ${endY}`} />
          )))}
        </g>
        <circle cx="12" cy="17" r="5.5" fill="#3a2a3a" strokeWidth="1.6" />
        <circle cx="12" cy="11" r="3.4" fill="#3a2a3a" strokeWidth="1.4" />
        <circle cx="10.8" cy="10.4" r=".8" fill="#e0394f" stroke="none" />
        <circle cx="13.2" cy="10.4" r=".8" fill="#e0394f" stroke="none" />
      </g>
    ),
    scene: (
      <g>
        <SpiderWeb /><SpiderWeb isMirrored />
        <circle cx="86" cy="52" r="3" fill="#3a2a3a" />
        <path d="M86 38 V50" stroke={INK_COLOR} strokeWidth="1" />
      </g>
    ),
  },
};
