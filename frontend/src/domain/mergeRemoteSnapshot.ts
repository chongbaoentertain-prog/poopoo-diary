import { CHARACTERS } from '../data/characters';
import { EMPTY_APP_STATE } from './emptyAppState';
import type { AppState, CheckIn } from '../types/diary';
import type { RemoteSnapshot } from '../types/sync';
import { createInitialProgress } from './evolution';
import { normalizeAppState } from './normalizeAppState';

/**
 * 把云端数据并进本地。纯函数,不碰网络和存储。
 *
 * - shouldWipeLocal:别的设备清空过全部数据,先清掉本地再合并。
 * - 签到记录只增不改、id 唯一,所以直接按 id 取并集;被软删除的删掉本地同 id 的。
 * - 角色进度取并集,毕业状态只会 false → true。**不处理进度的删除标记**:进度只会因「清空」被删,
 *   而清空已经由 shouldWipeLocal 处理;若再按标记删,用户清空后马上重选同一只角色会被误删。
 * - 个人资料(昵称、头像、当前培育的角色)后写者胜。
 */
export function mergeRemoteSnapshot(localState: AppState, remote: RemoteSnapshot, shouldWipeLocal: boolean): AppState {
  const baseState = shouldWipeLocal ? EMPTY_APP_STATE : localState;
  const knownCharacterIds = new Set(CHARACTERS.map((character) => character.id));

  const checkInsById = new Map<string, CheckIn>(baseState.checkIns.map((checkIn) => [checkIn.id, checkIn]));
  for (const remoteCheckIn of remote.checkIns) {
    if (remoteCheckIn.deleted) {
      checkInsById.delete(remoteCheckIn.id);
      continue;
    }
    if (!checkInsById.has(remoteCheckIn.id)) {
      // 经验/连续天数/倍率是派生数据,normalizeAppState 会重算
      checkInsById.set(remoteCheckIn.id, {
        id: remoteCheckIn.id,
        date: remoteCheckIn.date,
        at: remoteCheckIn.at,
        characterId: remoteCheckIn.characterId,
        stampId: remoteCheckIn.stampId,
        counted: remoteCheckIn.counted,
        xpGained: 0,
        streak: 0,
        multiplier: 1,
      });
    }
  }

  const progressByCharacterId = new Map(baseState.progress.map((progress) => [progress.characterId, progress]));
  for (const remoteProgress of remote.progress) {
    if (remoteProgress.deleted || !knownCharacterIds.has(remoteProgress.characterId)) continue;
    const localProgress = progressByCharacterId.get(remoteProgress.characterId) ?? createInitialProgress(remoteProgress.characterId);
    progressByCharacterId.set(remoteProgress.characterId, {
      ...localProgress,
      graduated: localProgress.graduated || remoteProgress.graduated,
    });
  }

  let { profile, activeCharacterId, profileUpdatedAt } = baseState;
  const remoteProfile = remote.profile;
  if (remoteProfile && (!profile || remoteProfile.updatedAt > (profileUpdatedAt ?? 0))) {
    profile = { nickname: remoteProfile.nickname, avatarId: remoteProfile.avatarId, anonymous: remoteProfile.anonymous };
    activeCharacterId = remoteProfile.activeCharacterId;
    profileUpdatedAt = remoteProfile.updatedAt;
  }

  return normalizeAppState({
    ...baseState,
    profile,
    activeCharacterId,
    profileUpdatedAt,
    checkIns: [...checkInsById.values()],
    progress: [...progressByCharacterId.values()],
  });
}
