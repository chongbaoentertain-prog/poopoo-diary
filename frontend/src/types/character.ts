/**
 * 心情。从好到坏依次是:舒畅 → 淡定 → 躺平 → 憋屈 → 泄气 → 嫌弃 → 崩溃,中文名见 data/moods.ts。
 * 早期版本用过别的内部名字(happy / think / sleep / speechless / sad / nausea / dizzy),
 * 旧签到记录里还留着,读取时由 domain/stamp.ts 统一转换。
 */
export type Mood = 'refreshed' | 'calm' | 'lyingFlat' | 'sulky' | 'deflated' | 'disgusted' | 'breakdown';

/** 形态 4/5 的穿戴配饰,绘制见 components/poo/PooGear.tsx */
export type Accessory =
  | 'shades' | 'cap' | 'crown' | 'earring' | 'makeup' | 'leaf' | 'flame' | 'bandage' | 'bubbles' | 'sweat' | 'sparkle'
  | 'mushroom' | 'flowers' | 'pirate' | 'chef' | 'party' | 'hardhat' | 'turban' | 'tie' | 'mask' | 'goggles' | 'horns' | 'eyebags' | 'spiderlegs';

/** 系列文件里手写的角色数据 */
export interface CharacterSeed {
  id: string;
  name: string; // 以「噗」结尾,形态 1~3 的名字由它派生
  stage4Name: string;
  stage5Name: string;
  stage4Accessories: Accessory[];
  stage5ExtraAccessories: Accessory[]; // 形态 5 在形态 4 的基础上新增的配饰
  quotes: string[]; // 分享卡片上的搞笑文案,要贴合角色(至少 3 句,随机轮换)
}

/** 一个属性系列(金、木、水……),下面有若干只角色 */
export interface Series {
  id: string;
  attribute: string; // 属性名(金/木/…),UI 上显示
  bodyColor: string; // 身体基础色
  accentColor: string; // 点缀色
  characters: CharacterSeed[];
}

/** 运行时使用的完整角色定义 */
export interface CharacterDefinition extends Omit<CharacterSeed, 'stage4Name' | 'stage5Name'> {
  seriesId: string;
  attribute: string;
  bodyColor: string;
  accentColor: string;
  stageNames: [string, string, string, string, string];
}
