import { earth } from './earth';
import { fire } from './fire';
import { gold } from './gold';
import { poison } from './poison';
import type { CharacterDef, Mood } from './types';
import { water } from './water';
import { weak } from './weak';
import { wood } from './wood';

export type { Acc, CharacterDef, Mood } from './types';

// 7 个系列(属性)× 每系列 3 只。新增角色:在对应系列文件加一条,再到 components/art/kits 补它的道具和场景(见 docs/characters.md)。
const SERIES = [gold, wood, water, fire, earth, weak, poison];

// 同系列 3 只的身体深浅略有不同 [混入色, 比例%]
const SHADE: [string, number][] = [['white', 0], ['white', 16], ['black', 14]];

export const CHARACTERS: CharacterDef[] = SERIES.flatMap((s) =>
  s.characters.map(({ stage4, stage5, ...c }, i): CharacterDef => {
    const short = c.name.replace('噗', '');
    const [mix, pct] = SHADE[i];
    return {
      ...c, series: s.key, attr: s.attr, accent: s.accent,
      tint: pct ? `color-mix(in srgb, ${s.tint} ${100 - pct}%, ${mix})` : s.tint,
      stageNames: [`${short}拉稀`, `${short}条条`, `${short}三层`, stage4, stage5],
    };
  }),
);

export const charDef = (id: string) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

/** 签到时让用户选的今日心情,按从好到坏排列 */
export const MOODS: { id: Mood; label: string }[] = [
  { id: 'happy', label: '舒畅' }, { id: 'think', label: '淡定' }, { id: 'sleep', label: '躺平' }, { id: 'speechless', label: '憋屈' },
  { id: 'sad', label: '泄气' }, { id: 'nausea', label: '嫌弃' }, { id: 'dizzy', label: '崩溃' },
];
