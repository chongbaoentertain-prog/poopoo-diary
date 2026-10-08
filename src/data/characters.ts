// 7 个系列(属性)× 每系列 5 只。每个系列第 1 只沿用旧 id(gold/wood/...),其余为 gold2..gold5,旧存档不受影响。
export type Acc = 'shades' | 'cap' | 'crown' | 'earring' | 'makeup' | 'leaf' | 'flame' | 'bandage' | 'bubbles' | 'sweat' | 'sparkle';
export type Mood = 'happy' | 'think' | 'speechless' | 'sleep' | 'dizzy' | 'nausea' | 'sad';

export interface CharacterDef {
  id: string; series: string; name: string; attr: string; tint: string; accent: string; tagline: string;
  stageNames: [string, string, string, string, string];
  acc4: Acc[]; acc5: Acc[]; // 形态 4 配饰;形态 5 在其基础上再加
  moods: Mood[]; // 随机表情池
  pose4?: Mood; pose5?: Mood; // 进化后的固定"行为"(优先于随机表情)
}

// [名字, 形态4名, 形态5名, 形态4配饰, 形态5新增配饰, 形态4行为?, 形态5行为?]
type V = [string, string, string, string, string, Mood?, Mood?];
const SERIES: { key: string; attr: string; tint: string; accent: string; moods: Mood[]; v: V[] }[] = [
  { key: 'gold', attr: '金', tint: '#b98a2e', accent: '#f4c542', moods: ['happy', 'think', 'speechless'], v: [
    ['金元宝噗', '墨镜金老板', '黄金大亨', 'shades', 'crown earring sparkle'], ['招财噗', '戴帽财神', '财神爷', 'cap', 'crown sparkle'],
    ['金牙噗', '耳环大哥', '金牙巨星', 'earring', 'shades sparkle'], ['金砖噗', '镀金噗', '纯金噗', 'sparkle', 'shades crown'],
    ['首富噗', '暴发户', '世界首富', 'shades earring', 'crown sparkle'] ] },
  { key: 'wood', attr: '木', tint: '#7d6b3b', accent: '#6aa84f', moods: ['happy', 'sleep', 'think'], v: [
    ['木噗', '叶帽小森', '森林之王', 'leaf', 'makeup sparkle'], ['竹子噗', '竹林隐士', '竹林剑圣', 'leaf', 'shades sparkle'],
    ['蘑菇噗', '蘑菇帽噗', '蘑菇女王', 'cap', 'makeup earring', 'sleep'], ['花花噗', '花冠噗', '花仙子', 'leaf makeup', 'crown sparkle'],
    ['盆栽噗', '阳台盆栽', '植物大佬', 'leaf', 'shades sparkle', 'sleep'] ] },
  { key: 'water', attr: '水', tint: '#6b7f95', accent: '#4aa3df', moods: ['happy', 'sleep', 'dizzy'], v: [
    ['水噗', '鸭舌帽噗', '海洋歌姬', 'cap', 'makeup earring sparkle', undefined, 'sleep'], ['泡泡噗', '泡泡王子', '泡泡女王', 'bubbles', 'crown sparkle'],
    ['海盗噗', '独眼船长', '深海海盗王', 'cap earring', 'shades sparkle'], ['浪花噗', '冲浪达人', '浪花之神', 'shades', 'crown sparkle'],
    ['冰块噗', '冰镇噗', '冰雪王者', 'sparkle', 'crown shades'] ] },
  { key: 'fire', attr: '火', tint: '#a8512a', accent: '#e5483b', moods: ['happy', 'speechless', 'dizzy'], v: [
    ['火噗', '火焰噗', '烈焰摇滚', 'flame', 'shades earring sparkle'], ['辣椒噗', '辣度爆表', '魔鬼辣椒', 'flame', 'makeup crown'],
    ['炭烧噗', '烧烤大师', '烈火主厨', 'cap', 'flame shades'], ['火山噗', '喷发噗', '火山之王', 'flame sparkle', 'crown'],
    ['烟花噗', '派对噗', '烟火巨星', 'sparkle', 'makeup earring shades'] ] },
  { key: 'earth', attr: '土', tint: '#8a5a3c', accent: '#b08a55', moods: ['happy', 'think', 'sleep'], v: [
    ['土噗', '安全帽噗', '大地酷盖', 'cap', 'shades sparkle', 'think'], ['石头噗', '磐石噗', '山岳之主', 'sparkle', 'crown'],
    ['沙丘噗', '沙漠旅人', '沙漠法老', 'shades', 'crown earring'], ['泥巴噗', '泥浆摔角手', '泥王', 'cap', 'earring sparkle'],
    ['矿工噗', '挖矿达人', '宝藏猎人', 'cap', 'shades sparkle'] ] },
  { key: 'weak', attr: '衰弱', tint: '#a89a86', accent: '#9aa7b5', moods: ['sad', 'sleep', 'dizzy', 'nausea'], v: [
    ['衰噗', '打针绷带噗', '墨镜硬撑王', 'bandage sweat', 'shades', 'nausea'], ['感冒噗', '鼻塞噗', '带病上岗', 'sweat', 'bandage shades'],
    ['熬夜噗', '黑眼圈噗', '熬夜冠军', 'sweat', 'makeup', 'sleep'], ['社畜噗', '加班噗', '过劳之王', 'cap sweat', 'shades'],
    ['软趴趴噗', '瘫软噗', '咸鱼大师', 'bandage', 'sweat sparkle'] ] },
  { key: 'poison', attr: '中毒', tint: '#6b7a3a', accent: '#9b59d0', moods: ['nausea', 'dizzy', 'happy'], v: [
    ['毒噗', '冒泡毒噗', '万毒女王', 'bubbles', 'makeup earring', undefined, 'dizzy'], ['毒蛇噗', '蛇蝎美人', '眼镜蛇女王', 'makeup', 'earring crown'],
    ['毒雾噗', '烟雾缭绕', '毒雾魔王', 'bubbles', 'shades'], ['药剂噗', '炼金学徒', '炼金大师', 'bubbles cap', 'sparkle crown'],
    ['蜘蛛噗', '暗夜蜘蛛', '毒网女王', 'shades', 'makeup earring bubbles'] ] },
];

// 同系列 5 只的身体深浅略有不同 [混入色, 比例%]
const SHADE: [string, number][] = [['white', 0], ['white', 16], ['black', 14], ['white', 30], ['black', 28]];
const accs = (s: string) => s.split(' ').filter(Boolean) as Acc[];

export const CHARACTERS: CharacterDef[] = SERIES.flatMap((s) =>
  s.v.map(([name, n4, n5, a4, a5, p4, p5], i): CharacterDef => {
    const short = name.replace('噗', '');
    const [mix, pct] = SHADE[i];
    return {
      id: i === 0 ? s.key : `${s.key}${i + 1}`, series: s.key, name, attr: s.attr, accent: s.accent,
      tint: pct ? `color-mix(in srgb, ${s.tint} ${100 - pct}%, ${mix})` : s.tint,
      tagline: `${s.attr}系列`, stageNames: [`${short}拉稀`, `${short}条条`, `${short}三层`, n4, n5],
      acc4: accs(a4), acc5: accs(a5), moods: s.moods, pose4: p4, pose5: p5,
    };
  }),
);

export const charDef = (id: string) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
export const randomMood = (id: string): Mood => {
  const pool = charDef(id).moods;
  return pool[Math.floor(Math.random() * pool.length)];
};
export const poseFor = (id: string, stage: number): Mood | undefined => {
  const d = charDef(id);
  return stage >= 5 ? (d.pose5 ?? d.pose4) : stage >= 4 ? d.pose4 : undefined;
};
