import { charDef, type Acc, type Mood } from '../../data/characters';
import { Body } from './Body';
import { Face } from './Face';
import { Gear } from './Gear';
import { KITS } from './kits';

/**
 * 一只噗 = 场景(形态 5) + 光晕 + 身体 + 专属道具 + 脸 + 配饰(形态 4/5)。
 * 道具/场景按角色 id 在 kits/ 里登记;换正式插画只需替换 art/ 下的文件。
 * scene=false 用于头像、日历等小尺寸场合,避免背景太杂。
 */
export function Poo({ characterId, stage, size = 96, silhouette = false, mood = 'happy', scene = true }: {
  characterId: string; stage: number; size?: number; silhouette?: boolean; mood?: Mood; scene?: boolean;
}) {
  const def = charDef(characterId);
  const kit = KITS[def.id];
  const acc = new Set<Acc>([...(stage >= 4 ? def.acc4 : []), ...(stage >= 5 ? def.acc5 : [])]);
  const has = (a: Acc) => acc.has(a);
  const y = stage === 1 ? 76 : stage === 2 ? 70 : 57; // 脸的位置

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${def.name} 形态${stage}`}
      style={silhouette ? { filter: 'brightness(0)' } : undefined}>
      {stage >= 5 && <circle cx="50" cy="58" r="46" fill={def.accent} opacity=".18" />}
      {stage >= 5 && scene && kit?.scene}
      <Body stage={stage} tint={def.tint} />
      {kit && <g transform="translate(73 62)">{kit.prop}</g>}
      {stage >= 5 && scene && kit?.front}
      <Face x={50} y={y} m={mood} has={has} />
      <Gear has={has} accent={def.accent} />
    </svg>
  );
}
