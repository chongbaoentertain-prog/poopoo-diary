import type { Series } from './types';

export const wood: Series = {
  key: 'wood', attr: '木', tint: '#7d6b3b', accent: '#6aa84f',
  characters: [
    { id: 'wood-bamboo', name: '竹子噗', stage4: '竹林隐士', stage5: '竹林剑圣', acc4: ['leaf'], acc5: ['shades', 'sparkle'],
      quotes: ['节节高升,今天也节节通畅', '竹林深处,一声叹息……是我', '长势喜人,继续保持'] },
    { id: 'wood-mushroom', name: '蘑菇噗', stage4: '蘑菇帽噗', stage5: '蘑菇女王', acc4: ['mushroom'], acc5: ['makeup', 'crown'],
      quotes: ['雨后蘑菇,雨后噗噗', '躲在蘑菇下,安静地完成使命', '别看我小,我很有营养(作为肥料)'] },
    { id: 'wood-flower', name: '花花噗', stage4: '花冠噗', stage5: '花仙子', acc4: ['flowers'], acc5: ['makeup', 'sparkle'],
      quotes: ['花开的声音,和另一种声音', '今天的我,是一朵盛开的花', '香不香不重要,重要的是开了'] },
  ],
};
