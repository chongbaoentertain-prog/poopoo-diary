import type { Series } from './types';

export const gold: Series = {
  key: 'gold', attr: '金', tint: '#b98a2e', accent: '#f4c542',
  characters: [
    { id: 'gold-ingot', name: '金元宝噗', stage4: '墨镜金老板', stage5: '黄金大亨', acc4: ['shades'], acc5: ['crown', 'earring', 'sparkle'] },
    { id: 'gold-fortune', name: '招财噗', stage4: '戴帽财神', stage5: '财神爷', acc4: ['cap'], acc5: ['crown', 'sparkle'] },
    { id: 'gold-tycoon', name: '首富噗', stage4: '暴发户', stage5: '世界首富', acc4: ['shades', 'earring'], acc5: ['crown', 'sparkle'] },
  ],
};
