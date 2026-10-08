export type Mood = 'happy' | 'think' | 'speechless' | 'sleep' | 'dizzy' | 'nausea' | 'sad';

/** 形态 4/5 的穿戴配饰,绘制见 components/art/gear.tsx */
export type Acc =
  | 'shades' | 'cap' | 'crown' | 'earring' | 'makeup' | 'leaf' | 'flame' | 'bandage' | 'bubbles' | 'sweat' | 'sparkle'
  | 'mushroom' | 'flowers' | 'pirate' | 'chef' | 'party' | 'hardhat' | 'turban' | 'tie' | 'mask' | 'goggles' | 'horns' | 'eyebags' | 'spiderlegs';

/** 系列文件里手写的角色数据 */
export interface CharacterSeed {
  id: string;
  name: string; // 以「噗」结尾,形态 1~3 的名字由它派生
  stage4: string;
  stage5: string;
  acc4: Acc[]; // 形态 4 配饰
  acc5: Acc[]; // 形态 5 在 acc4 基础上新增的配饰
}

export interface Series {
  key: string;
  attr: string; // 属性名(金/木/…),UI 上显示
  tint: string; // 身体基础色
  accent: string; // 点缀色
  characters: CharacterSeed[];
}

/** 运行时使用的完整角色定义 */
export interface CharacterDef extends Omit<CharacterSeed, 'stage4' | 'stage5'> {
  series: string;
  attr: string;
  tint: string;
  accent: string;
  stageNames: [string, string, string, string, string];
}
