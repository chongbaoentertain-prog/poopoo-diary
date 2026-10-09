import { earthKits } from './earthKits';
import { fireKits } from './fireKits';
import { goldKits } from './goldKits';
import { poisonKits } from './poisonKits';
import type { Kit } from './CharacterKit';
import { waterKits } from './waterKits';
import { weakKits } from './weakKits';
import { woodKits } from './woodKits';

/** 角色 id → 专属道具和场景。每个角色都要有一条(见 docs/art-guide.md)。 */
export const KITS: Record<string, Kit> = {
  ...goldKits, ...woodKits, ...waterKits, ...fireKits, ...earthKits, ...weakKits, ...poisonKits,
};
