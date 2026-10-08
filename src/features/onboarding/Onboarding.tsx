import { useState } from 'react';
import { CharacterPicker } from '../../components/CharacterPicker';
import { CHARACTERS } from '../../data/characters';
import { useAppStore } from '../../store/useAppStore';

export function Onboarding() {
  const complete = useAppStore((s) => s.completeOnboarding);
  const [nickname, setNickname] = useState('');
  const [characterId, setCharacterId] = useState(CHARACTERS[0].id);

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-3xl font-semibold">噗噗日记</h1>
      <label className="block space-y-1">
        <span>昵称(留空即匿名,之后可在「个人」修改)</span>
        <input value={nickname} maxLength={12} onChange={(e) => setNickname(e.target.value)}
          placeholder="匿名噗友" className="w-full rounded-lg border border-grout bg-porcelain p-3" />
      </label>
      <div className="space-y-2">
        <div>
          <div className="font-semibold">挑选你的第一只伙伴</div>
          <div className="text-sm">陪它每天打卡,看它一步步进化成最终形态。它也会成为你的头像。</div>
        </div>
        <CharacterPicker options={CHARACTERS} value={characterId} onPick={(c) => setCharacterId(c.id)} />
      </div>
      <button onClick={() => complete({ nickname: nickname.trim(), avatarId: characterId, anonymous: !nickname.trim() }, characterId)}
        className="w-full rounded-xl bg-brown p-3 font-semibold text-porcelain">开始签到</button>
    </main>
  );
}
