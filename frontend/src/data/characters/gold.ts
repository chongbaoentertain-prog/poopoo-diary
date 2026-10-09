import type { Series } from '../../types/character';

export const gold: Series = {
  key: 'gold', attr: '金', tint: '#b98a2e', accent: '#f4c542',
  characters: [
    { id: 'gold-ingot', name: '金元宝噗', stage4: '墨镜金老板', stage5: '黄金大亨', acc4: ['shades'], acc5: ['crown', 'earring', 'sparkle'],
      quotes: ['今天也是闪闪发光的一坨', '黄金万两,不如一次通畅', '这坨,值钱'] },
    { id: 'gold-fortune', name: '招财噗', stage4: '戴帽财神', stage5: '财神爷', acc4: ['cap'], acc5: ['crown', 'sparkle'],
      quotes: ['招财进宝,先从"进宝"的反方向开始', '福到了,噗也到了', '财运亨通,肠道也亨通'] },
    { id: 'gold-tycoon', name: '首富噗', stage4: '暴发户', stage5: '世界首富', acc4: ['shades', 'earring'], acc5: ['crown', 'sparkle'],
      quotes: ['钞票山前,我只想上厕所', '首富的烦恼:钱太多,纸不够', '有钱人的快乐,就是这么朴实无华'] },
  ],
};
