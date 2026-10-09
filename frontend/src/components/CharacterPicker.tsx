import { useState } from 'react';
import { CHARACTERS } from '../data/characters';
import type { CharacterDefinition } from '../types/character';
import type { CharacterId } from '../types/diary';
import { Poo } from './poo/Poo';

const ALL_ATTRIBUTES_LABEL = '全部';
const ATTRIBUTE_FILTERS = [ALL_ATTRIBUTES_LABEL, ...new Set(CHARACTERS.map((character) => character.attribute))];
const ALL_STAGES = [1, 2, 3, 4, 5];

interface EvolutionCardProps {
  character: CharacterDefinition;
  isChosen: boolean;
  onConfirm?: () => void;
}

/** 进化卡片:直接展示 5 个形态的样子,选角前先看到它会长成什么 */
function EvolutionCard({ character, isChosen, onConfirm }: EvolutionCardProps) {
  return (
    <div className="space-y-2 rounded-2xl border-2 bg-tile p-3" style={{ borderColor: character.accentColor }} role="status">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{character.name} <span className="text-xs font-normal" style={{ color: character.accentColor }}>{character.attribute}属性</span></div>
        {!isChosen && <span className="rounded-full bg-porcelain px-2 py-0.5 text-[10px]">进化示例</span>}
      </div>
      <div className="grid grid-cols-5 gap-1 text-center">
        {ALL_STAGES.map((stage) => (
          <div key={stage} className={`rounded-lg p-0.5 ${stage === 5 ? 'bg-porcelain ring-2 ring-gold' : 'bg-porcelain/60'}`}>
            <div className="text-[9px] opacity-70">{stage === 5 ? '最终形态' : `形态${stage}`}</div>
            <div className="flex justify-center"><Poo characterId={character.id} stage={stage} size={44} /></div>
            <div className="text-[9px] leading-tight">{character.stageNames[stage - 1]}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-xs opacity-70">{isChosen ? '每天签到攒经验,它就会一步步进化' : '点下面的伙伴,看看它会进化成什么样'}</div>
      {onConfirm && <button onClick={onConfirm} className="w-full rounded-lg bg-brown p-2 font-semibold text-porcelain">就决定是你了!</button>}
    </div>
  );
}

interface CharacterPickerProps {
  options: CharacterDefinition[];
  selectedCharacterId?: CharacterId;
  onPick: (character: CharacterDefinition) => void;
  /** true:点击只预览,按「就决定是你了!」才算选定;false:点击即选中 */
  requiresConfirmation?: boolean;
}

/** 按属性筛选的选角网格(新手选角、毕业换角共用) */
export function CharacterPicker({ options, selectedCharacterId, onPick, requiresConfirmation = false }: CharacterPickerProps) {
  const [attributeFilter, setAttributeFilter] = useState(ALL_ATTRIBUTES_LABEL);
  const [previewedCharacterId, setPreviewedCharacterId] = useState<CharacterId>();
  const visibleCharacters = options.filter((character) => attributeFilter === ALL_ATTRIBUTES_LABEL || character.attribute === attributeFilter);
  const focusedCharacterId = requiresConfirmation ? previewedCharacterId : selectedCharacterId;
  const focusedCharacter = options.find((character) => character.id === focusedCharacterId);
  const characterShownInCard = focusedCharacter ?? visibleCharacters[0] ?? options[0];

  return (
    <div className="space-y-2">
      {characterShownInCard && (
        <EvolutionCard
          character={characterShownInCard}
          isChosen={!!focusedCharacter}
          onConfirm={requiresConfirmation && focusedCharacter ? () => onPick(focusedCharacter) : undefined}
        />
      )}
      <div className="text-xs">属性系列</div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="属性系列">
        {ATTRIBUTE_FILTERS.map((attribute) => (
          <button key={attribute} aria-pressed={attributeFilter === attribute} onClick={() => setAttributeFilter(attribute)}
            className={`rounded-full px-3 py-1 text-sm ${attributeFilter === attribute ? 'bg-brown text-porcelain' : 'bg-porcelain'}`}>{attribute}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {visibleCharacters.map((character) => (
          <button key={character.id} onClick={() => (requiresConfirmation ? setPreviewedCharacterId(character.id) : onPick(character))} aria-pressed={focusedCharacterId === character.id}
            className={`rounded-xl border-2 bg-porcelain p-1 text-center ${focusedCharacterId === character.id ? 'border-gold' : 'border-grout'}`}>
            <div className="flex justify-center"><Poo characterId={character.id} stage={1} size={56} /></div><div className="text-[11px]">{character.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
