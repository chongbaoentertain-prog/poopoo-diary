import { Avatar } from '../../components/Avatar';
import { Poo } from '../../components/art/Poo';
import { CHARACTERS, charDef } from '../../data/characters';
import { GraduatePanel } from '../character/GraduatePanel';
import { useAppStore } from '../../store/useAppStore';

export function ProfilePage() {
  const profile = useAppStore((s) => s.profile)!;
  const progress = useAppStore((s) => s.progress);
  const update = useAppStore((s) => s.updateProfile);
  const resetAll = useAppStore((s) => s.resetAll);

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
        <div className="text-sm">头像(灰色的还没解锁)</div>
        <div className="max-h-56 overflow-y-auto rounded-xl border-2 border-grout p-2">
          <div className="grid grid-cols-5 gap-2">
            {CHARACTERS.map((c) => {
              const p = progress.find((x) => x.characterId === c.id);
              return p ? (
                <button key={c.id} aria-pressed={profile.avatarId === c.id} aria-label={c.name} onClick={() => update({ avatarId: c.id })}
                  className={`rounded-full border-2 bg-tile p-1 ${profile.avatarId === c.id ? 'border-gold' : 'border-grout'}`}>
                  <Poo characterId={c.id} stage={p.stage} size={48} />
                </button>
              ) : (
                <div key={c.id} aria-label="未解锁" className="rounded-full border-2 border-transparent bg-neutral-300 p-1">
                  <Poo characterId={c.id} stage={1} size={48} silhouette />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4"><div className="text-sm font-semibold">更换角色</div><GraduatePanel /></div>

      <div className="flex justify-center pt-2">
        <button onClick={() => window.confirm('清除所有签到记录和角色,重新开始?') && resetAll()}
          className="rounded-xl border-2 border-brown bg-gold/40 px-6 py-2 font-semibold text-brown">重置全部数据</button>
      </div>
    </section>
  );
}
