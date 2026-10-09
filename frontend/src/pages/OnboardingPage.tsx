import { useState } from 'react';
import { CharacterPicker } from '../components/CharacterPicker';
import { CHARACTERS } from '../data/characters';
import { RestoreForm, UndoClear } from '../features/sync';
import { useAppStore } from '../hooks/useAppStore';
import { syncEngine } from '../services/sync';

export function OnboardingPage() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [nickname, setNickname] = useState('');
  const [chosenCharacterId, setChosenCharacterId] = useState(CHARACTERS[0].id);
  const [isRestoreFormOpen, setIsRestoreFormOpen] = useState(false);

  const trimmedNickname = nickname.trim();

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-3xl font-semibold">噗噗日记</h1>
      <UndoClear />
      <label className="block space-y-1">
        <span>昵称(留空即匿名,之后可在「个人」修改)</span>
        <input value={nickname} maxLength={12} onChange={(event) => setNickname(event.target.value)}
          placeholder="匿名噗友" className="w-full rounded-lg border border-grout bg-porcelain p-3" />
      </label>
      <div className="space-y-2">
        <div>
          <div className="font-semibold">挑选你的第一只伙伴</div>
          <div className="text-sm">陪它每天打卡,看它一步步进化成最终形态。它也会成为你的头像。</div>
        </div>
        <CharacterPicker options={CHARACTERS} selectedCharacterId={chosenCharacterId} onPick={(character) => setChosenCharacterId(character.id)} />
      </div>
      <button onClick={() => completeOnboarding({ nickname: trimmedNickname, avatarId: chosenCharacterId, anonymous: !trimmedNickname }, chosenCharacterId)}
        className="w-full rounded-xl bg-brown p-3 font-semibold text-porcelain">开始签到</button>
      {syncEngine && (
        <div className="space-y-2 border-t border-grout pt-4 text-center text-sm">
          <button onClick={() => setIsRestoreFormOpen(!isRestoreFormOpen)} aria-expanded={isRestoreFormOpen} className="underline">已经有存档码?恢复之前的记录</button>
          {isRestoreFormOpen && <RestoreForm />}
        </div>
      )}
    </main>
  );
}
