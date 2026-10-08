import { useState } from 'react';
import { CHARACTERS, type CharacterDef } from '../data/characters';
import { Poo } from './art/Poo';

const ATTRS = ['全部', ...new Set(CHARACTERS.map((c) => c.attr))];

/** 按系列筛选的选角网格(新手选角、毕业换角共用) */
export function CharacterPicker({ options, value, onPick }: { options: CharacterDef[]; value?: string; onPick: (c: CharacterDef) => void }) {
  const [attr, setAttr] = useState('全部');
  const shown = options.filter((c) => attr === '全部' || c.attr === attr);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="系列">
        {ATTRS.map((a) => (
          <button key={a} aria-pressed={attr === a} onClick={() => setAttr(a)}
            className={`rounded-full px-3 py-1 text-sm ${attr === a ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>{a}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {shown.map((c) => (
          <button key={c.id} onClick={() => onPick(c)} aria-pressed={value === c.id}
            className={`rounded-xl border-2 bg-porcelain p-1 text-center ${value === c.id ? 'border-gold' : 'border-grout'}`}>
            <Poo characterId={c.id} stage={1} size={56} /><div className="text-[11px]">{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
