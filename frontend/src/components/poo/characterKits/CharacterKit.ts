import type { ReactNode } from 'react';

/**
 * 一只噗的专属美术。
 * prop:放在身体右下角的道具,在 24×28 的局部坐标里画(整体会 translate 到画布右下)。
 * scene:形态 5 的背景(画在身体后面)。
 * foreground:形态 5 的前景(画在身体前面,压住身体下缘,做"钞票山"之类)。
 */
export interface CharacterKit {
  prop: ReactNode;
  scene: ReactNode;
  foreground?: ReactNode;
}
