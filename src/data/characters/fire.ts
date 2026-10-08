import type { Series } from './types';

export const fire: Series = {
  key: 'fire', attr: '火', tint: '#a8512a', accent: '#e5483b',
  characters: [
    { id: 'fire-chili', name: '辣椒噗', stage4: '辣度爆表', stage5: '魔鬼辣椒', acc4: ['flame'], acc5: ['horns', 'sweat'] },
    { id: 'fire-grill', name: '炭烧噗', stage4: '烧烤大师', stage5: '烈火主厨', acc4: ['chef'], acc5: ['sweat'] },
    { id: 'fire-firework', name: '烟花噗', stage4: '派对噗', stage5: '烟火巨星', acc4: ['party'], acc5: ['shades', 'sparkle'] },
  ],
};
