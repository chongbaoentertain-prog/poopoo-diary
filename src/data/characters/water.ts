import type { Series } from './types';

export const water: Series = {
  key: 'water', attr: '水', tint: '#6b7f95', accent: '#4aa3df',
  characters: [
    { id: 'water-bubble', name: '泡泡噗', stage4: '泡泡王子', stage5: '泡泡女王', acc4: ['bubbles'], acc5: ['crown', 'sparkle'],
      quotes: ['噗噗噗,泡泡也在噗', '飘起来了,整个人都轻盈了', '一戳就破的,是我的烦恼'] },
    { id: 'water-pirate', name: '海盗噗', stage4: '独眼船长', stage5: '深海海盗王', acc4: ['pirate'], acc5: ['earring', 'sparkle'],
      quotes: ['出海!寻找肠道里的宝藏', '本船长宣布:货物已清空', '杰克船长也要靠岸补给'] },
    { id: 'water-ice', name: '冰块噗', stage4: '冰镇噗', stage5: '冰雪王者', acc4: ['sparkle'], acc5: ['crown', 'shades'],
      quotes: ['冷静,冷静,我在冰上稳住了', '融化吧,我的烦恼', '冰冰凉凉,一身轻松'] },
  ],
};
