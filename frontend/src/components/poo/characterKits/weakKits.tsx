import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';
import { Germ, Spark } from './sharedShapes';

const OUTLINE = { stroke: INK_COLOR, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

/** 一摞文件,从 bottomY 往上叠 sheetCount 张 */
const PaperStack = ({ x, bottomY, sheetCount }: { x: number; bottomY: number; sheetCount: number }) => (
  <g fill="#fff" stroke={INK_COLOR} strokeWidth="1.4" strokeLinejoin="round">
    {Array.from({ length: sheetCount }, (_, sheetIndex) => (
      <g key={sheetIndex}>
        <rect x={x + (sheetIndex % 2)} y={bottomY - (sheetIndex + 1) * 7} width="24" height="7" rx="1" />
        <path d={`M${x + 4} ${bottomY - sheetIndex * 7 - 3.5} h10`} stroke="#9aa7b5" strokeWidth="1.2" fill="none" />
      </g>
    ))}
  </g>
);

const FlyingPaper = ({ x, y, rotation }: { x: number; y: number; rotation: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
    <rect x="-6" y="-8" width="12" height="16" rx="1" fill="#fff" stroke={INK_COLOR} strokeWidth="1.3" />
    <path d="M-3 -3 h6 M-3 1 h6 M-3 5 h4" stroke="#9aa7b5" strokeWidth="1.1" fill="none" />
  </g>
);

const Star = ({ x, y, radius = 3 }: { x: number; y: number; radius?: number }) => (
  <Spark x={x} y={y} radius={radius} fill="#fff3a8" />
);

export const weakKits: Record<string, CharacterKit> = {
  // 社畜噗:公事包 + 办公室挂钟、满天文件、文件山
  'weak-worker': {
    prop: (
      <g {...OUTLINE}>
        <path d="M8 11 v-4 h8 v4" fill="none" strokeWidth="2" />
        <rect x="2" y="10" width="20" height="15" rx="2" fill="#5b4636" />
        <path d="M2 17 h20" strokeWidth="1.4" />
        <rect x="10" y="15" width="4" height="4" rx="1" fill="#f4c542" strokeWidth="1.2" />
      </g>
    ),
    scene: (
      <g>
        <g {...OUTLINE}>
          <circle cx="16" cy="18" r="11" fill="#fff" />
          <path d="M16 18 V11 M16 18 L21 20" fill="none" strokeWidth="2" strokeLinecap="round" />
        </g>
        <FlyingPaper x={82} y={15} rotation={20} /><FlyingPaper x={89} y={35} rotation={-15} /><FlyingPaper x={69} y={8} rotation={-25} />
      </g>
    ),
    foreground: (
      <g>
        <PaperStack x={0} bottomY={100} sheetCount={4} /><PaperStack x={74} bottomY={100} sheetCount={5} />
      </g>
    ),
  },
  // 熬夜噗:咖啡 + 月亮星星
  'weak-nightowl': {
    prop: (
      <g {...OUTLINE}>
        <path d="M4 11 h14 v9 q0 6 -7 6 q-7 0 -7 -6z" fill="#fff" />
        <path d="M18 14 q5 0 4 4 q-1 3 -4 3" fill="none" />
        <ellipse cx="11" cy="11" rx="7" ry="1.8" fill="#6b4a2f" strokeWidth="1.2" />
        <path d="M8 8 q-2 -3 0 -5 M13 8 q-2 -3 0 -5" fill="none" stroke="#9aa7b5" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
    scene: (
      <g>
        <path d="M82 6 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22z" fill="#ffe28a" stroke={INK_COLOR} strokeWidth="1.8" strokeLinejoin="round" />
        <Star x={14} y={14} radius={4} /><Star x={30} y={6} radius={3} /><Star x={8} y={38} radius={3} />
        <Star x={94} y={50} radius={3} /><Star x={70} y={22} radius={2.5} />
        <text x="18" y="46" fontSize="11" fontWeight="700" fill={INK_COLOR} opacity=".7">z</text>
      </g>
    ),
  },
  // 感冒噗:纸巾盒 + 病菌 + 纸巾团
  'weak-cold': {
    prop: (
      <g {...OUTLINE}>
        <path d="M9 12 q3 -9 6 0" fill="#fff" />
        <rect x="3" y="12" width="18" height="13" rx="2" fill="#bfe3ff" />
        <ellipse cx="12" cy="17" rx="5" ry="1.8" fill="#fff" strokeWidth="1.2" />
      </g>
    ),
    scene: (
      <g>
        <Germ x={14} y={14} radius={5} /><Germ x={30} y={6} radius={3} /><Germ x={88} y={16} radius={5} />
        <Germ x={94} y={42} radius={3.5} /><Germ x={6} y={46} radius={3.5} />
      </g>
    ),
    foreground: (
      <g fill="#fff" stroke={INK_COLOR} strokeWidth="1.5">
        <circle cx="10" cy="95" r="7" /><circle cx="22" cy="98" r="5" /><circle cx="90" cy="95" r="7.5" /><circle cx="78" cy="98" r="4.5" />
      </g>
    ),
  },
};
