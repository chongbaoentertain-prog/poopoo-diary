import type { Series } from './types';

export const weak: Series = {
  key: 'weak', attr: '衰弱', tint: '#a89a86', accent: '#9aa7b5',
  characters: [
    { id: 'weak-worker', name: '社畜噗', stage4: '加班噗', stage5: '过劳之王', acc4: ['tie', 'sweat'], acc5: ['eyebags'],
      quotes: ['像牛马一样,在屎海中奋力前行', '带薪拉屎,社畜最后的尊严', 'KPI 完不成,但这坨完成了'] },
    { id: 'weak-nightowl', name: '熬夜噗', stage4: '黑眼圈噗', stage5: '熬夜冠军', acc4: ['eyebags'], acc5: ['crown'],
      quotes: ['凌晨三点,肠道比我清醒', '熬夜的尽头,是厕所', '睡不着,拉不拉也不重要了'] },
    { id: 'weak-cold', name: '感冒噗', stage4: '鼻塞噗', stage5: '带病上岗', acc4: ['mask'], acc5: ['bandage', 'sweat'],
      quotes: ['鼻子堵了,但肠道通了', '带病上岗,一泻千里', '感冒了,但拉得很勇敢'] },
  ],
};
