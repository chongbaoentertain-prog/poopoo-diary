import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';
import { Flame, Spark } from './sharedShapes';

const OUTLINE = { stroke: INK_COLOR, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const EIGHT_DIRECTIONS = [0, 45, 90, 135, 180, 225, 270, 315];
const SIX_DIRECTIONS = [0, 60, 120, 180, 240, 300];
const GRILL_BAR_XS = [8, 24, 40, 56, 72, 88];
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** 一朵烟花:八个方向各一条短线加一个火星 */
const FireworkBurst = ({ x, y, radius, color }: { x: number; y: number; radius: number; color: string }) => (
  <g stroke={color} strokeWidth="2.2" strokeLinecap="round" fill={color}>
    {EIGHT_DIRECTIONS.map((angle) => {
      const directionX = Math.cos(toRadians(angle));
      const directionY = Math.sin(toRadians(angle));
      return (
        <g key={angle}>
          <line x1={x + directionX * radius * 0.45} y1={y + directionY * radius * 0.45} x2={x + directionX * radius * 0.85} y2={y + directionY * radius * 0.85} />
          <circle cx={x + directionX * radius} cy={y + directionY * radius} r="1.6" stroke="none" />
        </g>
      );
    })}
  </g>
);

const SmokePuff = ({ x, y, radius }: { x: number; y: number; radius: number }) => (
  <circle cx={x} cy={y} r={radius} fill="#d8d8de" opacity=".7" />
);

export const fireKits: Record<string, CharacterKit> = {
  // 辣椒噗:红辣椒 + 两侧烈焰
  'fire-chili': {
    prop: (
      <g {...OUTLINE}>
        <path d="M16 3 C22 2 22 2 22 2 C21 7 20 10 19 12 C14 20 8 24 3 27 C3 19 8 13 12 9 C14 7 15 5 16 3z" fill="#e5483b" />
        <path d="M16 3 q4 -3 8 -2" fill="none" stroke="#3f7a3b" strokeWidth="2.6" />
      </g>
    ),
    scene: (
      <g>
        <Flame x={10} y={100} scale={2.4} /><Flame x={10} y={100} scale={1.5} fill="#ff9a2f" />
        <Flame x={90} y={100} scale={2.6} /><Flame x={90} y={100} scale={1.6} fill="#ff9a2f" />
        <Flame x={20} y={60} scale={1} fill="#ff9a2f" /><Flame x={80} y={52} scale={1} fill="#ff9a2f" />
      </g>
    ),
  },
  // 炭烧噗:烤串 + 烤架炭火 + 烟
  'fire-grill': {
    prop: (
      <g {...OUTLINE}>
        <line x1="4" y1="27" x2="20" y2="2" strokeWidth="2" />
        <g fill="#b5562b" strokeWidth="1.5"><circle cx="9" cy="20" r="3.8" /><circle cx="13" cy="13" r="3.8" /><circle cx="17" cy="6.5" r="3.8" /></g>
      </g>
    ),
    scene: (
      <g>
        <SmokePuff x={12} y={26} radius={7} /><SmokePuff x={22} y={14} radius={5} /><SmokePuff x={8} y={10} radius={4} />
        <SmokePuff x={88} y={20} radius={6} /><SmokePuff x={80} y={8} radius={4} />
        <circle cx="94" cy="44" r="2" fill="#ff9a2f" /><circle cx="6" cy="46" r="2" fill="#ff9a2f" />
      </g>
    ),
    foreground: (
      <g>
        <ellipse cx="14" cy="98" rx="14" ry="5" fill="#e5483b" />
        <ellipse cx="50" cy="99" rx="26" ry="4" fill="#ff9a2f" />
        <ellipse cx="86" cy="98" rx="14" ry="5" fill="#e5483b" />
        <g stroke="#2a2a33" strokeWidth="2.2" strokeLinecap="round">
          <line x1="0" y1="90" x2="100" y2="90" />
          {GRILL_BAR_XS.map((barX) => <line key={barX} x1={barX} y1="90" x2={barX} y2="97" />)}
        </g>
      </g>
    ),
  },
  // 烟花噗:烟花棒 + 夜空烟花
  'fire-firework': {
    prop: (
      <g {...OUTLINE}>
        <line x1="6" y1="27" x2="14" y2="11" strokeWidth="2.2" />
        <g stroke="#f4c542" strokeWidth="2" strokeLinecap="round">
          {SIX_DIRECTIONS.map((angle) => (
            <line key={angle} x1="14" y1="9" x2={14 + Math.cos(toRadians(angle)) * 7} y2={9 + Math.sin(toRadians(angle)) * 7} />
          ))}
        </g>
      </g>
    ),
    scene: (
      <g>
        <FireworkBurst x={16} y={18} radius={14} color="#e5483b" /><FireworkBurst x={84} y={14} radius={12} color="#4aa3df" />
        <FireworkBurst x={90} y={50} radius={9} color="#b45cf0" /><FireworkBurst x={8} y={52} radius={7} color="#f4c542" />
        <Spark x={34} y={8} radius={3} />
      </g>
    ),
  },
};
