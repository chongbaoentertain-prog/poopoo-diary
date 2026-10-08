import type { Series } from './types';

export const poison: Series = {
  key: 'poison', attr: '中毒', tint: '#6b7a3a', accent: '#9b59d0',
  characters: [
    { id: 'poison-snake', name: '毒蛇噗', stage4: '蛇蝎美人', stage5: '眼镜蛇女王', acc4: ['makeup'], acc5: ['earring', 'crown'] },
    { id: 'poison-potion', name: '药剂噗', stage4: '炼金学徒', stage5: '炼金大师', acc4: ['goggles'], acc5: ['bubbles', 'sparkle'] },
    { id: 'poison-spider', name: '蜘蛛噗', stage4: '暗夜蜘蛛', stage5: '毒网女王', acc4: ['spiderlegs'], acc5: ['makeup', 'crown'] },
  ],
};
