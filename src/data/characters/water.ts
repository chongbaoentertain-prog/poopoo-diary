import type { Series } from './types';

export const water: Series = {
  key: 'water', attr: '水', tint: '#6b7f95', accent: '#4aa3df',
  characters: [
    { id: 'water-bubble', name: '泡泡噗', stage4: '泡泡王子', stage5: '泡泡女王', acc4: ['bubbles'], acc5: ['crown', 'sparkle'] },
    { id: 'water-pirate', name: '海盗噗', stage4: '独眼船长', stage5: '深海海盗王', acc4: ['pirate'], acc5: ['earring', 'sparkle'] },
    { id: 'water-ice', name: '冰块噗', stage4: '冰镇噗', stage5: '冰雪王者', acc4: ['sparkle'], acc5: ['crown', 'shades'] },
  ],
};
