import type { Series } from '../../types/character';

export const weak: Series = {
  id: 'weak', attribute: '衰弱', bodyColor: '#a89a86', accentColor: '#9aa7b5',
  characters: [
    { id: 'weak-worker', name: '社畜噗', stage4Name: '加班噗', stage5Name: '过劳之王', stage4Accessories: ['tie', 'sweat'], stage5ExtraAccessories: ['eyebags'],
      quotes: ['像牛马一样,在屎海中奋力前行', '带薪拉屎,社畜最后的尊严', 'KPI 完不成,但这坨完成了'] },
    { id: 'weak-nightowl', name: '熬夜噗', stage4Name: '黑眼圈噗', stage5Name: '熬夜冠军', stage4Accessories: ['eyebags'], stage5ExtraAccessories: ['crown'],
      quotes: ['凌晨三点,肠道比我清醒', '熬夜的尽头,是厕所', '睡不着,拉不拉也不重要了'] },
    { id: 'weak-cold', name: '感冒噗', stage4Name: '鼻塞噗', stage5Name: '带病上岗', stage4Accessories: ['mask'], stage5ExtraAccessories: ['bandage', 'sweat'],
      quotes: ['鼻子堵了,但肠道通了', '带病上岗,一泻千里', '感冒了,但拉得很勇敢'] },
  ],
};
