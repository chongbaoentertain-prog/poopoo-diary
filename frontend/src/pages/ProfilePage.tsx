import { Avatar } from '../components/Avatar';
import { Poo } from '../components/poo/Poo';
import { CHARACTERS } from '../data/characters';
import { GraduatePanel } from '../features/character';
import { ClearDataButton, SyncCard } from '../features/sync';
import { useAppStore } from '../hooks/useAppStore';

interface ProfilePageProps {
  /** 毕业后选好新角色时调用,用来跳回首页 */
  onNewCharacterChosen: () => void;
}

export function ProfilePage({ onNewCharacterChosen }: ProfilePageProps) {
  const profile = useAppStore((state) => state.profile)!;
  const progressList = useAppStore((state) => state.progress);
  const updateProfile = useAppStore((state) => state.updateProfile);

  // 已收集的角色排在前面,各自保持原来的顺序
  const avatarOptions = CHARACTERS
    .map((character) => ({ character, progress: progressList.find((entry) => entry.characterId === character.id) }))
    .sort((firstOption, secondOption) => Number(!!secondOption.progress) - Number(!!firstOption.progress));

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-porcelain p-4">
        <Avatar size={64} />
        <div className="font-semibold">{profile.anonymous || !profile.nickname ? '匿名噗友' : profile.nickname}</div>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4">
        <label className="block space-y-1"><span className="text-sm">昵称</span>
          <input value={profile.nickname} maxLength={12} onChange={(event) => updateProfile({ nickname: event.target.value })}
            className="w-full rounded-lg border border-grout p-2" /></label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!profile.anonymous} onChange={(event) => updateProfile({ anonymous: event.target.checked })} /> 匿名(隐藏昵称)
        </label>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4">
        <div>
          <div className="text-sm font-semibold">选择头像</div>
          <div className="text-xs">已收集的伙伴排在前面,可以用它们当头像。灰色的还在等你遇见。</div>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-xl border-2 border-grout p-2">
          <div className="grid grid-cols-5 gap-2">
            {avatarOptions.map(({ character, progress }) => progress ? (
              <button key={character.id} aria-pressed={profile.avatarId === character.id} aria-label={character.name} onClick={() => updateProfile({ avatarId: character.id })}
                className={`grid aspect-square place-items-center rounded-full border-2 bg-tile ${profile.avatarId === character.id ? 'border-gold' : 'border-grout'}`}>
                <Poo characterId={character.id} stage={progress.stage} size={44} showScene={false} />
              </button>
            ) : (
              <div key={character.id} aria-label="未解锁" className="grid aspect-square place-items-center rounded-full border-2 border-transparent bg-neutral-300">
                <Poo characterId={character.id} stage={1} size={44} silhouette showScene={false} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-porcelain p-4"><div className="text-sm font-semibold">更换角色</div><GraduatePanel onCharacterChosen={onNewCharacterChosen} /></div>

      <SyncCard />

      <ClearDataButton />
    </section>
  );
}
