import type { Series } from '../../types/character';

export const earth: Series = {
  id: 'earth', attribute: '土', bodyColor: '#8a5a3c', accentColor: '#b08a55',
  characters: [
    { id: 'earth-miner', name: '矿工噗', stage4Name: '挖矿达人', stage5Name: '宝藏猎人', stage4Accessories: ['hardhat'], stage5ExtraAccessories: ['shades', 'sparkle'],
      quotes: ['挖到宝了,挖到了大宝', '地下三百米,今天收获满满', '辛苦采矿,终于出矿'] },
    { id: 'earth-dune', name: '沙丘噗', stage4Name: '沙漠旅人', stage5Name: '沙漠法老', stage4Accessories: ['turban'], stage5ExtraAccessories: ['shades', 'earring'],
      quotes: ['沙漠里的一滴水,是此刻的畅快', '风吹沙动,噗噗无声', '走过漫漫黄沙,终于到了绿洲'] },
    { id: 'earth-rock', name: '石头噗', stage4Name: '磐石噗', stage5Name: '山岳之主', stage4Accessories: ['sparkle'], stage5ExtraAccessories: ['crown'],
      quotes: ['稳如泰山,拉也稳如泰山', '一块石头,落了地', '坚如磐石的一次'] },
  ],
};
