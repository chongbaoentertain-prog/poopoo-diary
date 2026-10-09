import type { Series } from '../../types/character';

export const wood: Series = {
  id: 'wood', attribute: '木', bodyColor: '#7d6b3b', accentColor: '#6aa84f',
  characters: [
    { id: 'wood-bamboo', name: '竹子噗', stage4Name: '竹林隐士', stage5Name: '竹林剑圣', stage4Accessories: ['leaf'], stage5ExtraAccessories: ['shades', 'sparkle'],
      quotes: ['节节高升,今天也节节通畅', '竹林深处,一声叹息……是我', '长势喜人,继续保持'] },
    { id: 'wood-mushroom', name: '蘑菇噗', stage4Name: '蘑菇帽噗', stage5Name: '蘑菇女王', stage4Accessories: ['mushroom'], stage5ExtraAccessories: ['makeup', 'crown'],
      quotes: ['雨后蘑菇,雨后噗噗', '躲在蘑菇下,安静地完成使命', '别看我小,我很有营养(作为肥料)'] },
    { id: 'wood-flower', name: '花花噗', stage4Name: '花冠噗', stage5Name: '花仙子', stage4Accessories: ['flowers'], stage5ExtraAccessories: ['makeup', 'sparkle'],
      quotes: ['花开的声音,和另一种声音', '今天的我,是一朵盛开的花', '香不香不重要,重要的是开了'] },
  ],
};
