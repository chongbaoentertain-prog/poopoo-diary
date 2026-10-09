import type { CharacterDefinition } from '../../types/character';
import { earth } from './earth';
import { fire } from './fire';
import { gold } from './gold';
import { poison } from './poison';
import { water } from './water';
import { weak } from './weak';
import { wood } from './wood';

// 7 个系列(属性)× 每系列 3 只。
// 新增角色:在对应系列文件加一条,再到 components/poo/characterKits 补它的道具和场景(见 docs/characters.md)。
const ALL_SERIES = [gold, wood, water, fire, earth, weak, poison];

// 同系列 3 只的身体深浅略有不同:往身体色里混入一点白或黑
const BODY_SHADE_VARIANTS = [
  { mixColor: 'white', mixPercent: 0 },
  { mixColor: 'white', mixPercent: 16 },
  { mixColor: 'black', mixPercent: 14 },
];

export const CHARACTERS: CharacterDefinition[] = ALL_SERIES.flatMap((series) =>
  series.characters.map(({ stage4Name, stage5Name, ...seed }, indexInSeries): CharacterDefinition => {
    const shortName = seed.name.replace('噗', '');
    const { mixColor, mixPercent } = BODY_SHADE_VARIANTS[indexInSeries];
    return {
      ...seed,
      seriesId: series.id,
      attribute: series.attribute,
      accentColor: series.accentColor,
      bodyColor: mixPercent
        ? `color-mix(in srgb, ${series.bodyColor} ${100 - mixPercent}%, ${mixColor})`
        : series.bodyColor,
      stageNames: [`${shortName}拉稀`, `${shortName}条条`, `${shortName}三层`, stage4Name, stage5Name],
    };
  }),
);

/** 按 id 取角色;id 找不到时(比如已下架角色留下的旧记录)用第一只兜底,保证界面不崩 */
export const getCharacter = (characterId: string): CharacterDefinition =>
  CHARACTERS.find((character) => character.id === characterId) ?? CHARACTERS[0];
