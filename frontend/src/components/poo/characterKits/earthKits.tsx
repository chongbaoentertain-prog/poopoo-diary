import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';
import { Gem, Spark } from './sharedShapes';

const OUTLINE = { stroke: INK_COLOR, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

/** 从画布顶部垂下的一排钟乳石,长度按位置错落 */
const Stalactites = ({ xPositions }: { xPositions: number[] }) => (
  <g fill="#9a8f84" stroke={INK_COLOR} strokeWidth="1.5" strokeLinejoin="round">
    {xPositions.map((x, index) => <path key={x} d={`M${x - 5} -1 L${x} ${9 + (index % 3) * 5} L${x + 5} -1z`} />)}
  </g>
);

const Rock = ({ x, y, scale, fill = '#a8a29a' }: { x: number; y: number; scale: number; fill?: string }) => (
  <path
    transform={`translate(${x} ${y}) scale(${scale})`}
    d="M-9 0 L-6 -9 L2 -12 L9 -5 L8 0z"
    fill={fill} stroke={INK_COLOR} strokeWidth={1.6 / scale} strokeLinejoin="round"
  />
);

export const earthKits: Record<string, CharacterKit> = {
  // 矿工噗:镐子 + 矿洞钟乳石 + 宝石
  'earth-miner': {
    prop: (
      <g {...OUTLINE}>
        <line x1="5" y1="27" x2="17" y2="6" stroke="#8a5a2c" strokeWidth="3" strokeLinecap="round" />
        <path d="M5 9 Q15 0 23 11" fill="none" stroke="#9aa7b5" strokeWidth="4" strokeLinecap="round" />
      </g>
    ),
    scene: (
      <g>
        <Stalactites xPositions={[6, 18, 32, 66, 80, 94]} />
        <Gem x={8} y={58} scale={1.5} fill="#6fd3e8" /><Gem x={93} y={46} scale={1.7} fill="#ff7a8a" />
      </g>
    ),
    foreground: (
      <g>
        <Rock x={10} y={100} scale={1.5} /><Gem x={20} y={96} scale={1.1} fill="#7be39a" />
        <Rock x={92} y={100} scale={1.6} /><Gem x={80} y={96} scale={1.2} fill="#6fd3e8" />
        <Spark x={50} y={95} radius={3} />
      </g>
    ),
  },
  // 沙丘噗:仙人掌 + 太阳金字塔沙丘
  'earth-dune': {
    prop: (
      <g {...OUTLINE}>
        <rect x="8" y="5" width="8" height="19" rx="4" fill="#5aa05a" />
        <path d="M8 15 h-3 a3 3 0 0 1 -3 -3 v-3" fill="none" stroke="#5aa05a" strokeWidth="4" strokeLinecap="round" />
        <path d="M16 12 h3 a3 3 0 0 0 3 -3 v-3" fill="none" stroke="#5aa05a" strokeWidth="4" strokeLinecap="round" />
        <path d="M7 23 h10 l-1 5 h-8z" fill="#d98a4e" />
      </g>
    ),
    scene: (
      <g {...OUTLINE}>
        <circle cx="84" cy="16" r="10" fill="#ffd966" />
        <path d="M2 80 L22 52 L42 80z" fill="#d9b36a" />
        <path d="M22 52 L32 80" fill="none" strokeWidth="1.2" />
      </g>
    ),
    foreground: <path d="M0 90 Q18 80 38 90 T78 88 T100 86 V100 H0z" fill="#e8c98a" stroke={INK_COLOR} strokeWidth="1.8" strokeLinejoin="round" />,
  },
  // 石头噗:石堆 + 雪山 + 鹅卵石
  'earth-rock': {
    prop: (
      <g {...OUTLINE}>
        <path d="M2 26 L5 16 L12 14 L16 26z" fill="#9aa0a6" />
        <path d="M12 26 L14 18 L20 17 L23 26z" fill="#b4b8bd" />
        <path d="M7 15 L9 8 L14 7 L15 14z" fill="#aeb3b8" />
      </g>
    ),
    scene: (
      <g {...OUTLINE}>
        <path d="M-4 90 L16 30 L36 90z" fill="#8f949a" />
        <path d="M16 30 L9 52 L16 46 L22 54z" fill="#fff" strokeWidth="1.4" />
        <path d="M62 90 L84 24 L106 90z" fill="#a1a6ac" />
        <path d="M84 24 L76 50 L84 44 L92 52z" fill="#fff" strokeWidth="1.4" />
      </g>
    ),
    foreground: (
      <g>
        <Rock x={14} y={100} scale={1.2} fill="#9aa0a6" /><Rock x={28} y={100} scale={0.8} fill="#b4b8bd" />
        <Rock x={86} y={100} scale={1.3} fill="#9aa0a6" /><Rock x={72} y={100} scale={0.8} fill="#b4b8bd" />
      </g>
    ),
  },
};
