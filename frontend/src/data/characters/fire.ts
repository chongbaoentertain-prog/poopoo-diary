import type { Series } from '../../types/character';

export const fire: Series = {
  key: 'fire', attr: '火', tint: '#a8512a', accent: '#e5483b',
  characters: [
    { id: 'fire-chili', name: '辣椒噗', stage4: '辣度爆表', stage5: '魔鬼辣椒', acc4: ['flame'], acc5: ['horns', 'sweat'],
      quotes: ['昨天的辣,今天加倍奉还', '辣的是嘴,烧的是……你懂的', '火烧火燎,但值得'] },
    { id: 'fire-grill', name: '炭烧噗', stage4: '烧烤大师', stage5: '烈火主厨', acc4: ['chef'], acc5: ['sweat'],
      quotes: ['烧烤自由的代价,我认了', '炭火不灭,噗噗不息', '串串吃多了,锅气在身体里转了一圈'] },
    { id: 'fire-firework', name: '烟花噗', stage4: '派对噗', stage5: '烟火巨星', acc4: ['party'], acc5: ['shades', 'sparkle'],
      quotes: ['砰!绽放了', '今日份烟花,准时燃放', '一声巨响,万事大吉'] },
  ],
};
