import type { Series } from './types';

export const wood: Series = {
  key: 'wood', attr: '木', tint: '#7d6b3b', accent: '#6aa84f',
  characters: [
    { id: 'wood-bamboo', name: '竹子噗', stage4: '竹林隐士', stage5: '竹林剑圣', acc4: ['leaf'], acc5: ['shades', 'sparkle'] },
    { id: 'wood-mushroom', name: '蘑菇噗', stage4: '蘑菇帽噗', stage5: '蘑菇女王', acc4: ['mushroom'], acc5: ['makeup', 'crown'] },
    { id: 'wood-flower', name: '花花噗', stage4: '花冠噗', stage5: '花仙子', acc4: ['flowers'], acc5: ['makeup', 'sparkle'] },
  ],
};
