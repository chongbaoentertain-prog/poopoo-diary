import type { Series } from '../../types/character';

export const fire: Series = {
  id: 'fire', attribute: '火', bodyColor: '#a8512a', accentColor: '#e5483b',
  characters: [
    { id: 'fire-chili', name: '辣椒噗', stage4Name: '辣度爆表', stage5Name: '魔鬼辣椒', stage4Accessories: ['flame'], stage5ExtraAccessories: ['horns', 'sweat'],
      quotes: ['昨天的辣,今天加倍奉还', '辣的是嘴,烧的是……你懂的', '火烧火燎,但值得'] },
    { id: 'fire-grill', name: '炭烧噗', stage4Name: '烧烤大师', stage5Name: '烈火主厨', stage4Accessories: ['chef'], stage5ExtraAccessories: ['sweat'],
      quotes: ['烧烤自由的代价,我认了', '炭火不灭,噗噗不息', '串串吃多了,锅气在身体里转了一圈'] },
    { id: 'fire-firework', name: '烟花噗', stage4Name: '派对噗', stage5Name: '烟火巨星', stage4Accessories: ['party'], stage5ExtraAccessories: ['shades', 'sparkle'],
      quotes: ['砰!绽放了', '今日份烟花,准时燃放', '一声巨响,万事大吉'] },
  ],
};
