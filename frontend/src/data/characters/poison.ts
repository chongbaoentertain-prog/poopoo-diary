import type { Series } from './types';

export const poison: Series = {
  key: 'poison', attr: '中毒', tint: '#6b7a3a', accent: '#9b59d0',
  characters: [
    { id: 'poison-snake', name: '毒蛇噗', stage4: '蛇蝎美人', stage5: '眼镜蛇女王', acc4: ['makeup'], acc5: ['earring', 'crown'],
      quotes: ['毒不倒我,只是有点冲', '蛇蝎美人,出手致命(气味)', '嘶——这味道有点毒'] },
    { id: 'poison-potion', name: '药剂噗', stage4: '炼金学徒', stage5: '炼金大师', acc4: ['goggles'], acc5: ['bubbles', 'sparkle'],
      quotes: ['这瓶药水,配方不明', '实验成功!但请勿模仿', '炼金失败,产物是一坨'] },
    { id: 'poison-spider', name: '蜘蛛噗', stage4: '暗夜蜘蛛', stage5: '毒网女王', acc4: ['spiderlegs'], acc5: ['makeup', 'crown'],
      quotes: ['织网守候,等待下一位……', '八条腿,八倍焦虑,一个出口', '暗夜出没,结网拉丝'] },
  ],
};
