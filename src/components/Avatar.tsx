import { Poo } from './art/Poo';
import { useAppStore } from '../store/useAppStore';

/** 头像 = 你拥有的某只噗(当前形态),不再是 emoji */
export function Avatar({ size = 40 }: { size?: number }) {
  const avatarId = useAppStore((s) => s.profile?.avatarId);
  const progress = useAppStore((s) => s.progress);
  const activeId = useAppStore((s) => s.activeCharacterId);
  const p = progress.find((x) => x.characterId === avatarId) ?? progress.find((x) => x.characterId === activeId);
  if (!p) return null;
  return (
    <div className="grid place-items-center overflow-hidden rounded-full bg-tile" style={{ width: size, height: size }}>
      <Poo characterId={p.characterId} stage={p.stage} size={size * 0.92} />
    </div>
  );
}
