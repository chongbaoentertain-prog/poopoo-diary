import type { Series } from './types';

export const earth: Series = {
  key: 'earth', attr: '土', tint: '#8a5a3c', accent: '#b08a55',
  characters: [
    { id: 'earth-miner', name: '矿工噗', stage4: '挖矿达人', stage5: '宝藏猎人', acc4: ['hardhat'], acc5: ['shades', 'sparkle'],
      quotes: ['挖到宝了,挖到了大宝', '地下三百米,今天收获满满', '辛苦采矿,终于出矿'] },
    { id: 'earth-dune', name: '沙丘噗', stage4: '沙漠旅人', stage5: '沙漠法老', acc4: ['turban'], acc5: ['shades', 'earring'],
      quotes: ['沙漠里的一滴水,是此刻的畅快', '风吹沙动,噗噗无声', '走过漫漫黄沙,终于到了绿洲'] },
    { id: 'earth-rock', name: '石头噗', stage4: '磐石噗', stage5: '山岳之主', acc4: ['sparkle'], acc5: ['crown'],
      quotes: ['稳如泰山,拉也稳如泰山', '一块石头,落了地', '坚如磐石的一次'] },
  ],
};
