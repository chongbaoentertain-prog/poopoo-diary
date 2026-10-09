import type { Series } from '../../types/character';

export const poison: Series = {
  id: 'poison', attribute: '中毒', bodyColor: '#6b7a3a', accentColor: '#9b59d0',
  characters: [
    { id: 'poison-snake', name: '毒蛇噗', stage4Name: '蛇蝎美人', stage5Name: '眼镜蛇女王', stage4Accessories: ['makeup'], stage5ExtraAccessories: ['earring', 'crown'],
      quotes: ['毒不倒我,只是有点冲', '蛇蝎美人,出手致命(气味)', '嘶——这味道有点毒'] },
    { id: 'poison-potion', name: '药剂噗', stage4Name: '炼金学徒', stage5Name: '炼金大师', stage4Accessories: ['goggles'], stage5ExtraAccessories: ['bubbles', 'sparkle'],
      quotes: ['这瓶药水,配方不明', '实验成功!但请勿模仿', '炼金失败,产物是一坨'] },
    { id: 'poison-spider', name: '蜘蛛噗', stage4Name: '暗夜蜘蛛', stage5Name: '毒网女王', stage4Accessories: ['spiderlegs'], stage5ExtraAccessories: ['makeup', 'crown'],
      quotes: ['织网守候,等待下一位……', '八条腿,八倍焦虑,一个出口', '暗夜出没,结网拉丝'] },
  ],
};
