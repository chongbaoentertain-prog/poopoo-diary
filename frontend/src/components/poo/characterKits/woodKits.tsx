import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';
import { Mushroom, Spark } from './sharedShapes';

const OUTLINE = { stroke: INK_COLOR, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const BAMBOO_NODE_YS = [20, 46, 72];
const FLOWER_PETAL_OFFSETS = [[0, -4], [4, -1], [-4, -1], [2.5, 3], [-2.5, 3]];

/** 一根竹子:left 为左边缘,贯穿整个画布 */
const BambooStalk = ({ left, width = 7, hasLeaves = true }: { left: number; width?: number; hasLeaves?: boolean }) => (
  <g {...OUTLINE}>
    <rect x={left} y="-2" width={width} height="104" rx={width / 2} fill="#6aa84f" />
    {BAMBOO_NODE_YS.map((nodeY) => <line key={nodeY} x1={left} y1={nodeY} x2={left + width} y2={nodeY} stroke="#3f6b2f" strokeWidth="1.6" />)}
    {hasLeaves && <path d={`M${left + width} 32 q10 -2 12 -9 q-10 -1 -12 9z M${left} 58 q-10 -2 -12 -9 q10 -1 12 9z`} fill="#8bc66a" strokeWidth="1.4" />}
  </g>
);

const Flower = ({ x, y, petalColor, scale = 1 }: { x: number; y: number; petalColor: string; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK_COLOR} strokeWidth={1.4 / scale} strokeLinejoin="round">
    <path d="M0 0 V12" fill="none" stroke="#3f7a3b" strokeWidth="1.8" />
    {FLOWER_PETAL_OFFSETS.map(([offsetX, offsetY]) => <circle key={`${offsetX}${offsetY}`} cx={offsetX} cy={offsetY} r="3.2" fill={petalColor} />)}
    <circle r="2.4" fill="#f4c542" />
  </g>
);

const Butterfly = ({ x, y, wingColor }: { x: number; y: number; wingColor: string }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK_COLOR} strokeWidth="1.2" strokeLinejoin="round">
    <path d="M0 0 q-8 -9 -9 -2 q0 6 9 2z M0 0 q8 -9 9 -2 q0 6 -9 2z" fill={wingColor} />
    <path d="M0 -1 v6" />
  </g>
);

const Firefly = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r="5" fill="#fff3a8" opacity=".45" />
    <circle cx={x} cy={y} r="2" fill="#f4c542" />
  </g>
);

export const woodKits: Record<string, CharacterKit> = {
  // 竹子噗:竹笋/竹子 + 满屏竹林
  'wood-bamboo': {
    prop: (
      <g {...OUTLINE}>
        <rect x="9" y="2" width="6" height="24" rx="3" fill="#6aa84f" />
        <line x1="9" y1="10" x2="15" y2="10" stroke="#3f6b2f" />
        <line x1="9" y1="19" x2="15" y2="19" stroke="#3f6b2f" />
        <path d="M15 9 q8 -2 8 -7 q-8 0 -8 7z" fill="#8bc66a" />
      </g>
    ),
    scene: (
      <g>
        <BambooStalk left={2} /><BambooStalk left={13} width={6} hasLeaves={false} />
        <BambooStalk left={81} width={6} hasLeaves={false} /><BambooStalk left={91} />
      </g>
    ),
  },
  // 蘑菇噗:小蘑菇 + 森林萤火虫
  'wood-mushroom': {
    prop: <Mushroom x={12} y={26} scale={1.15} />,
    scene: (
      <g>
        <Firefly x={14} y={14} /><Firefly x={30} y={6} /><Firefly x={86} y={18} /><Firefly x={94} y={40} /><Firefly x={8} y={44} />
      </g>
    ),
    foreground: (
      <g>
        <Mushroom x={9} y={98} scale={1.2} /><Mushroom x={22} y={100} scale={0.8} />
        <Mushroom x={91} y={98} scale={1.3} /><Mushroom x={78} y={100} scale={0.8} />
      </g>
    ),
  },
  // 花花噗:花 + 蝴蝶花田
  'wood-flower': {
    prop: <Flower x={12} y={12} petalColor="#ff8fa0" scale={1.25} />,
    scene: (
      <g>
        <Butterfly x={14} y={14} wingColor="#f4a6d7" /><Butterfly x={30} y={30} wingColor="#ffd966" /><Butterfly x={86} y={12} wingColor="#8ed1ff" />
        <Spark x={92} y={34} radius={3} />
      </g>
    ),
    foreground: (
      <g>
        <Flower x={6} y={86} petalColor="#ff8fa0" scale={1.1} /><Flower x={18} y={90} petalColor="#fff" scale={0.9} /><Flower x={30} y={94} petalColor="#f4a6d7" scale={0.8} />
        <Flower x={94} y={86} petalColor="#ffd966" scale={1.1} /><Flower x={82} y={90} petalColor="#ff8fa0" scale={0.9} /><Flower x={70} y={94} petalColor="#fff" scale={0.8} />
      </g>
    ),
  },
};
