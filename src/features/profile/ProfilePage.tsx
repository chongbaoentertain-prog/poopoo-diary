import { Avatar } from '../../components/Avatar';
import { Poo } from '../../components/art/Poo';
import { CHARACTERS, charDef } from '../../data/characters';
import { GraduatePanel } from '../character/GraduatePanel';
import { ClearDataButton } from '../sync/ClearDataButton';
import { SyncCard } from '../sync/SyncCard';
import { useAppStore } from '../../store/useAppStore';

export function ProfilePage({ onPicked }: { onPicked: () => void }) {
  const profile = useAppStore((s) => s.profile)!;
  const progress = useAppStore((s) => s.progress);
  const update = useAppStore((s) => s.updateProfile);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-porcelain p-4">
        <Avatar size={64} />
        <div className="font-semibold">{profile.anonymous || !profile.nickname ? '匿名噗友' : profile.nickname}</div>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4">
        <label className="block space-y-1"><span className="text-sm">昵称</span>
          <input value={profile.nickname} maxLength={12} onChange={(e) => update({ nickname: e.target.value })}
            className="w-full rounded-lg border border-grout p-2" /></label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!profile.anonymous} onChange={(e) => update({ anonymous: e.target.checked })} /> 匿名(隐藏昵称)
        </label>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4">
        <div>
          <div className="text-sm font-semibold">选择头像</div>
          <div className="text-xs">已收集的伙伴排在前面,可以用它们当头像。灰色的还在等你遇见。</div>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-xl border-2 border-grout p-2">
          <div className="grid grid-cols-5 gap-2">
            {[...CHARACTERS]
              .map((c) => ({ c, p: progress.find((x) => x.characterId === c.id) }))
              .sort((a, b) => Number(!!b.p) - Number(!!a.p))
              .map(({ c, p }) => p ? (
                <button key={c.id} aria-pressed={profile.avatarId === c.id} aria-label={c.name} onClick={() => update({ avatarId: c.id })}
                  className={`grid aspect-square place-items-center rounded-full border-2 bg-tile ${profile.avatarId === c.id ? 'border-gold' : 'border-grout'}`}>
                  <Poo characterId={c.id} stage={p.stage} size={44} scene={false} />
                </button>
              ) : (
                <div key={c.id} aria-label="未解锁" className="grid aspect-square place-items-center rounded-full border-2 border-transparent bg-neutral-300">
                  <Poo characterId={c.id} stage={1} size={44} silhouette scene={false} />
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4"><div className="text-sm font-semibold">更换角色</div><GraduatePanel onPicked={onPicked} /></div>

      <SyncCard />

      <ClearDataButton />
    </section>
  );
}
