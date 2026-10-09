import { STROKE } from './inkStyle';

/** 形态 1 拉稀 → 2 硬条 → 3 及以上三层经典 */
export function Body({ stage, tint }: { stage: number; tint: string }) {
  return (
    <g fill={tint} {...STROKE}>
      {stage === 1 && <><path d="M10 82 Q8 68 26 68 Q30 54 46 58 Q56 44 70 58 Q92 58 91 77 Q93 91 70 91 L30 91 Q10 93 10 82Z" /><circle cx="80" cy="95" r="2.5" /></>}
      {stage === 2 && <><rect x="12" y="50" width="76" height="40" rx="20" /><path d="M30 54 q-3 16 0 32 M70 54 q3 16 0 32" fill="none" strokeWidth="2" /></>}
      {stage >= 3 && <>
        <ellipse cx="50" cy="77" rx="36" ry="17" /><ellipse cx="50" cy="57" rx="28" ry="15" />
        <ellipse cx="50" cy="39" rx="19" ry="12" /><ellipse cx="50" cy="26" rx="8" ry="7" />
        <ellipse cx="38" cy="49" rx="4" ry="1.8" fill="#fff" opacity=".35" stroke="none" />
      </>}
    </g>
  );
}
