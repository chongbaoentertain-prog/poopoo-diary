import { earthKits } from './earth';
import { fireKits } from './fire';
import { goldKits } from './gold';
import { poisonKits } from './poison';
import type { Kit } from './types';
import { waterKits } from './water';
import { weakKits } from './weak';
import { woodKits } from './wood';

/** 角色 id → 专属道具和场景。每个角色都要有一条(见 docs/art-guide.md)。 */
export const KITS: Record<string, Kit> = {
  ...goldKits, ...woodKits, ...waterKits, ...fireKits, ...earthKits, ...weakKits, ...poisonKits,
};
