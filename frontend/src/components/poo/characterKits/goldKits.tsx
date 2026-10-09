import { INK_COLOR } from '../inkStyle';
import type { CharacterKit } from './CharacterKit';
import { Coin, Spark } from './sharedShapes';

const OUTLINE = { stroke: INK_COLOR, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const GoldIngot = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} {...OUTLINE}>
    <path d="M1 14 Q12 19 23 14 Q22 25 18 26 L6 26 Q2 25 1 14z" fill="#f4c542" />
    <path d="M6 15 Q12 4 18 15" fill="#ffd966" />
  </g>
);

const RedLantern = ({ x }: { x: number }) => (
  <g {...OUTLINE} strokeWidth={1.5}>
    <line x1={x} y1="0" x2={x} y2="8" />
    <ellipse cx={x} cy="19" rx="8" ry="10" fill="#d9433a" />
    <rect x={x - 4} y="7" width="8" height="3" fill="#f4c542" />
    <rect x={x - 4} y="28" width="8" height="3" fill="#f4c542" />
    <path d={`M${x} 31 v7`} />
    <circle cx={x} cy="39" r="1.8" fill="#f4c542" />
  </g>
);

/** 一摞钞票堆成的小山。isMirrored 为 true 时左右翻转,用来放在画布右侧 */
const BanknotePile = ({ x, y, isMirrored = false }: { x: number; y: number; isMirrored?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${isMirrored ? -1 : 1} 1)`} fill="#7fc17b" stroke={INK_COLOR} strokeWidth="1.4" strokeLinejoin="round">
    <rect x="0" y="-8" width="30" height="8" rx="1.5" />
    <rect x="2" y="-16" width="25" height="8" rx="1.5" />
    <rect x="5" y="-24" width="19" height="8" rx="1.5" />
    <rect x="9" y="-32" width="12" height="8" rx="1.5" />
    <g fill="none" stroke="#3f7a3b" strokeWidth="1.2">
      <circle cx="15" cy="-4" r="2" /><circle cx="14.5" cy="-12" r="2" /><circle cx="14.5" cy="-20" r="2" />
    </g>
  </g>
);

const FlyingBanknote = ({ x, y, rotation }: { x: number; y: number; rotation: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
    <rect x="-8" y="-4.5" width="16" height="9" rx="1.5" fill="#7fc17b" stroke={INK_COLOR} strokeWidth="1.3" />
    <circle r="2.2" fill="none" stroke="#3f7a3b" strokeWidth="1.1" />
  </g>
);

export const goldKits: Record<string, CharacterKit> = {
  // 金元宝噗:元宝 + 金币雨
  'gold-ingot': {
    prop: <GoldIngot x={0} y={0} />,
    scene: (
      <g>
        <Coin x={12} y={14} radius={6} /><Coin x={28} y={5} radius={4.5} /><Coin x={86} y={10} radius={5.5} />
        <Coin x={94} y={30} radius={4} /><Coin x={6} y={40} radius={4} /><Coin x={93} y={56} radius={4.5} />
      </g>
    ),
    foreground: (
      <g>
        <GoldIngot x={0} y={80} scale={1.1} /><GoldIngot x={11} y={84} scale={0.8} />
        <GoldIngot x={73} y={82} scale={1} /><GoldIngot x={85} y={86} scale={0.8} />
      </g>
    ),
  },
  // 招财噗:红包 + 红灯笼
  'gold-fortune': {
    prop: (
      <g {...OUTLINE}>
        <rect x="4" y="2" width="16" height="24" rx="2" fill="#d9433a" />
        <path d="M4 2 h16 v9 Q12 16 4 11z" fill="#b8322b" />
        <circle cx="12" cy="11" r="3.6" fill="#f4c542" />
      </g>
    ),
    scene: (
      <g>
        <RedLantern x={13} /><RedLantern x={87} />
        <Spark x={30} y={10} radius={4} /><Spark x={72} y={8} radius={3.5} />
      </g>
    ),
  },
  // 首富噗:钱袋 + 钞票山
  'gold-tycoon': {
    prop: (
      <g {...OUTLINE}>
        <path d="M12 3 q-5 4 -3 7 Q2 14 3 22 Q4 27 12 27 Q20 27 21 22 Q22 14 15 10 Q17 7 12 3z" fill="#c9b27c" />
        <path d="M9 10 q3 2 6 0" fill="none" />
        <text x="12" y="23" fontSize="11" fontWeight="700" textAnchor="middle" fill={INK_COLOR} stroke="none">$</text>
      </g>
    ),
    scene: (
      <g>
        <FlyingBanknote x={14} y={14} rotation={-20} /><FlyingBanknote x={30} y={28} rotation={15} />
        <FlyingBanknote x={86} y={12} rotation={25} /><FlyingBanknote x={90} y={36} rotation={-15} />
        <FlyingBanknote x={10} y={48} rotation={10} />
      </g>
    ),
    foreground: (
      <g>
        <BanknotePile x={0} y={100} /><BanknotePile x={100} y={100} isMirrored />
      </g>
    ),
  },
};
