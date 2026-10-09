import { useAppStore } from '../hooks/useAppStore';
import { Poo } from './poo/Poo';

/** 头像 = 你拥有的某只噗(当前形态),不再是 emoji */
export function Avatar({ size = 40 }: { size?: number }) {
  const avatarCharacterId = useAppStore((state) => state.profile?.avatarId);
  const progressList = useAppStore((state) => state.progress);
  const activeCharacterId = useAppStore((state) => state.activeCharacterId);
  const avatarProgress =
    progressList.find((entry) => entry.characterId === avatarCharacterId) ??
    progressList.find((entry) => entry.characterId === activeCharacterId);
  if (!avatarProgress) return null;
  return (
    <div className="grid place-items-center overflow-hidden rounded-full bg-tile" style={{ width: size, height: size }}>
      <Poo characterId={avatarProgress.characterId} stage={avatarProgress.stage} size={size * 0.92} showScene={false} />
    </div>
  );
}
