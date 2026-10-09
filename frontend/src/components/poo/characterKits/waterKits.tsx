import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';
import { Bubble, Snowflake, Spark } from './sharedShapes';

const OUTLINE = { stroke: INK_COLOR, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

/** 从画布顶部垂下的一排冰柱,长度按位置错落 */
const Icicles = ({ xPositions }: { xPositions: number[] }) => (
  <g fill="#dff3ff" stroke="#7ab8e6" strokeWidth="1.4" strokeLinejoin="round">
    {xPositions.map((x, index) => <path key={x} d={`M${x - 4} -1 L${x} ${10 + (index % 3) * 5} L${x + 4} -1z`} />)}
  </g>
);

export const waterKits: Record<string, CharacterKit> = {
  // 泡泡噗:泡泡 + 漫天大泡泡
  'water-bubble': {
    prop: (
      <g>
        <Bubble x={9} y={19} radius={8} opacity={0.7} /><Bubble x={19} y={8} radius={5} opacity={0.7} /><Bubble x={5} y={5} radius={3} opacity={0.7} />
      </g>
    ),
    scene: (
      <g>
        <Bubble x={14} y={20} radius={10} /><Bubble x={30} y={6} radius={5} /><Bubble x={86} y={16} radius={8} />
        <Bubble x={93} y={44} radius={6} /><Bubble x={8} y={56} radius={6} /><Bubble x={90} y={74} radius={9} />
      </g>
    ),
  },
  // 海盗噗:宝箱 + 海上帆船
  'water-pirate': {
    prop: (
      <g {...OUTLINE}>
        <rect x="2" y="12" width="20" height="14" rx="2" fill="#8a5a2c" />
        <path d="M2 12 Q12 0 22 12z" fill="#a56a35" />
        <path d="M8 12 v14 M16 12 v14" fill="none" strokeWidth="1.4" />
        <circle cx="12" cy="17" r="2.4" fill="#f4c542" />
      </g>
    ),
    scene: (
      <g {...OUTLINE}>
        <circle cx="16" cy="16" r="8" fill="#ffd966" />
        <path d="M66 28 h24 l-4 7 h-16z" fill="#8a5a2c" />
        <line x1="78" y1="10" x2="78" y2="28" />
        <path d="M78 11 L90 25 H78z M76 13 L66 25 H76z" fill="#fff" strokeWidth="1.4" />
      </g>
    ),
    foreground: (
      <g>
        <path d="M0 88 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 V100 H0z" fill="#4aa3df" opacity=".85" stroke="#2d7cb5" strokeWidth="1.6" />
        <path d="M6 94 q4 -3 8 0 M44 95 q4 -3 8 0 M78 94 q4 -3 8 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  // 冰块噗:冰块 + 冰柱 + 雪
  'water-ice': {
    prop: (
      <g {...OUTLINE}>
        <rect x="4" y="8" width="16" height="16" rx="3" fill="#cfeeff" fillOpacity=".9" />
        <path d="M8 12 v5 M8 12 h5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    ),
    scene: (
      <g>
        <Icicles xPositions={[6, 18, 30, 70, 82, 94]} />
        <Snowflake x={14} y={44} radius={5} /><Snowflake x={90} y={50} radius={6} />
        <Snowflake x={8} y={68} radius={4} /><Snowflake x={94} y={24} radius={4} />
      </g>
    ),
    foreground: (
      <g fill="#fff" stroke="#9fcbe8" strokeWidth="1.5">
        <ellipse cx="8" cy="98" rx="20" ry="9" />
        <ellipse cx="94" cy="98" rx="22" ry="10" />
        <Spark x={36} y={94} radius={3} fill="#dff3ff" />
      </g>
    ),
  },
};
