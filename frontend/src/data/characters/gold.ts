import type { Series } from '../../types/character';

export const gold: Series = {
  id: 'gold', attribute: '金', bodyColor: '#b98a2e', accentColor: '#f4c542',
  characters: [
    { id: 'gold-ingot', name: '金元宝噗', stage4Name: '墨镜金老板', stage5Name: '黄金大亨', stage4Accessories: ['shades'], stage5ExtraAccessories: ['crown', 'earring', 'sparkle'],
      quotes: ['今天也是闪闪发光的一坨', '黄金万两,不如一次通畅', '这坨,值钱'] },
    { id: 'gold-fortune', name: '招财噗', stage4Name: '戴帽财神', stage5Name: '财神爷', stage4Accessories: ['cap'], stage5ExtraAccessories: ['crown', 'sparkle'],
      quotes: ['招财进宝,先从"进宝"的反方向开始', '福到了,噗也到了', '财运亨通,肠道也亨通'] },
    { id: 'gold-tycoon', name: '首富噗', stage4Name: '暴发户', stage5Name: '世界首富', stage4Accessories: ['shades', 'earring'], stage5ExtraAccessories: ['crown', 'sparkle'],
      quotes: ['钞票山前,我只想上厕所', '首富的烦恼:钱太多,纸不够', '有钱人的快乐,就是这么朴实无华'] },
  ],
};
