import { getCharacter } from '../../data/characters';
import { DEFAULT_MOOD } from '../../data/moods';
import type { Accessory, Mood } from '../../types/character';
import type { CharacterId } from '../../types/diary';
import { CHARACTER_KITS } from './characterKits';
import { PooBody } from './PooBody';
import { PooFace } from './PooFace';
import { PooGear } from './PooGear';

interface PooProps {
  characterId: CharacterId;
  stage: number;
  size?: number;
  silhouette?: boolean; // 剪影:用于还没解锁的角色
  mood?: Mood;
  /** 是否画形态 5 的场景和前景。头像、日历、签到印章等小尺寸场合关掉,避免背景太杂 */
  showScene?: boolean;
}

/** 脸在画布上的纵向位置:形态 1、2 的身体矮,脸更靠下 */
const faceYByStage = (stage: number) => (stage === 1 ? 76 : stage === 2 ? 70 : 57);

/**
 * 一只噗 = 场景(形态 5) + 光晕 + 身体 + 专属道具 + 前景(形态 5) + 脸 + 配饰(形态 4/5)。
 * 道具/场景按角色 id 在 characterKits/ 里登记;换正式插画只需替换 components/poo/ 下的文件。
 */
export function Poo({ characterId, stage, size = 96, silhouette = false, mood = DEFAULT_MOOD, showScene = true }: PooProps) {
  const character = getCharacter(characterId);
  const characterKit = CHARACTER_KITS[character.id];
  const accessories = new Set<Accessory>([
    ...(stage >= 4 ? character.stage4Accessories : []),
    ...(stage >= 5 ? character.stage5ExtraAccessories : []),
  ]);
  const hasAccessory = (accessory: Accessory) => accessories.has(accessory);
  const sceneVisible = stage >= 5 && showScene;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${character.name} 形态${stage}`}
      style={silhouette ? { filter: 'brightness(0)' } : undefined}>
      {stage >= 5 && <circle cx="50" cy="58" r="46" fill={character.accentColor} opacity=".18" />}
      {sceneVisible && characterKit?.scene}
      <PooBody stage={stage} bodyColor={character.bodyColor} />
      {characterKit && <g transform="translate(73 62)">{characterKit.prop}</g>}
      {sceneVisible && characterKit?.foreground}
      <PooFace faceX={50} faceY={faceYByStage(stage)} mood={mood} hasAccessory={hasAccessory} />
      <PooGear hasAccessory={hasAccessory} accentColor={character.accentColor} />
    </svg>
  );
}
