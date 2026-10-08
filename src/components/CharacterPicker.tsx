import { useState } from 'react';
import { CHARACTERS, type CharacterDef } from '../data/characters';
import { Poo } from './art/Poo';

const ATTRS = ['全部', ...new Set(CHARACTERS.map((c) => c.attr))];
const STAGES = [1, 2, 3, 4, 5];

/** 进化卡片:直接展示 5 个形态的样子,选角前先看到它会长成什么 */
function EvolutionCard({ def, chosen, onConfirm }: { def: CharacterDef; chosen: boolean; onConfirm?: () => void }) {
  return (
    <div className="space-y-2 rounded-2xl border-2 bg-tile p-3" style={{ borderColor: def.accent }} role="status">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{def.name} <span className="text-xs font-normal" style={{ color: def.accent }}>{def.attr}属性</span></div>
        {!chosen && <span className="rounded-full bg-porcelain px-2 py-0.5 text-[10px]">进化示例</span>}
      </div>
      <div className="grid grid-cols-5 gap-1 text-center">
        {STAGES.map((st) => (
          <div key={st} className={`rounded-lg p-0.5 ${st === 5 ? 'bg-porcelain ring-2 ring-gold' : 'bg-porcelain/60'}`}>
            <div className="text-[9px] opacity-70">{st === 5 ? '最终形态' : `形态${st}`}</div>
            <div className="flex justify-center"><Poo characterId={def.id} stage={st} size={44} /></div>
            <div className="text-[9px] leading-tight">{def.stageNames[st - 1]}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-xs opacity-70">{chosen ? '每天签到攒经验,它就会一步步进化' : '点下面的伙伴,看看它会进化成什么样'}</div>
      {onConfirm && <button onClick={onConfirm} className="w-full rounded-lg bg-brown p-2 font-semibold text-porcelain">就决定是你了!</button>}
    </div>
  );
}

/**
 * 按属性筛选的选角网格(新手选角、毕业换角共用)。
 * confirm=false:点击即选中(value 受控);confirm=true:点击只预览,按「就决定是你了!」才 onPick。
 */
export function CharacterPicker({ options, value, onPick, confirm = false }: {
  options: CharacterDef[]; value?: string; onPick: (c: CharacterDef) => void; confirm?: boolean;
}) {
  const [attr, setAttr] = useState('全部');
  const [peek, setPeek] = useState<string>();
  const shown = options.filter((c) => attr === '全部' || c.attr === attr);
  const focusId = confirm ? peek : value;
  const focus = options.find((c) => c.id === focusId);
  const sample = focus ?? shown[0] ?? options[0];
  return (
    <div className="space-y-2">
      {sample && <EvolutionCard def={sample} chosen={!!focus} onConfirm={confirm && focus ? () => onPick(focus) : undefined} />}
      <div className="text-xs">属性系列</div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="属性系列">
        {ATTRS.map((a) => (
          <button key={a} aria-pressed={attr === a} onClick={() => setAttr(a)}
            className={`rounded-full px-3 py-1 text-sm ${attr === a ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>{a}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {shown.map((c) => (
          <button key={c.id} onClick={() => (confirm ? setPeek(c.id) : onPick(c))} aria-pressed={focusId === c.id}
            className={`rounded-xl border-2 bg-porcelain p-1 text-center ${focusId === c.id ? 'border-gold' : 'border-grout'}`}>
            <div className="flex justify-center"><Poo characterId={c.id} stage={1} size={56} /></div><div className="text-[11px]">{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
