import type { Series } from './types';

export const earth: Series = {
  key: 'earth', attr: '土', tint: '#8a5a3c', accent: '#b08a55',
  characters: [
    { id: 'earth-miner', name: '矿工噗', stage4: '挖矿达人', stage5: '宝藏猎人', acc4: ['hardhat'], acc5: ['shades', 'sparkle'] },
    { id: 'earth-dune', name: '沙丘噗', stage4: '沙漠旅人', stage5: '沙漠法老', acc4: ['turban'], acc5: ['shades', 'earring'] },
    { id: 'earth-rock', name: '石头噗', stage4: '磐石噗', stage5: '山岳之主', acc4: ['sparkle'], acc5: ['crown'] },
  ],
};
