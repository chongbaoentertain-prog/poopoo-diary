import type { Accessory, Mood } from '../../types/character';
import { INK_COLOR } from './inkStyle';

interface PooFaceProps {
  faceX: number;
  faceY: number;
  mood: Mood;
  hasAccessory: (accessory: Accessory) => boolean;
}

const EYE_OFFSETS_X = [-9, 9]; // 左眼、右眼
const CHEEK_OFFSETS_X = [-17, 17];
const TEAR_OFFSETS_X = [-9, 9];

function getMouthPath(mood: Mood, faceX: number, faceY: number): string {
  switch (mood) {
    case 'refreshed': return `M${faceX - 5} ${faceY + 8} q5 6 10 0`;
    case 'lyingFlat': return `M${faceX - 2} ${faceY + 9} q2 3 4 0`;
    case 'breakdown': return `M${faceX - 7} ${faceY + 7} q7 -4 14 0 q0 8 -7 8 q-7 0 -7 -8z`; // 😭 张大嘴哭
    case 'disgusted': return `M${faceX - 5} ${faceY + 8} q5 -2 10 0 q1 7 -5 7 q-6 0 -5 -7z`; // 张嘴吐
    case 'deflated': return `M${faceX - 5} ${faceY + 11} q5 -5 10 0`;
    case 'sulky': return `M${faceX - 4} ${faceY + 10} q4 -3 8 0`;
    default: return `M${faceX - 4} ${faceY + 9} h8`; // 淡定:一条平线
  }
}

/** 脸:表情由 mood 决定;戴墨镜 / 化妆会影响眼睛的画法 */
export function PooFace({ faceX, faceY, mood, hasAccessory }: PooFaceProps) {
  const hasLipstick = hasAccessory('makeup') && mood === 'refreshed';
  const mouthPath = getMouthPath(mood, faceX, faceY);

  return (
    <>
      <g fill="none" stroke={INK_COLOR} strokeWidth="2" strokeLinecap="round">
        {EYE_OFFSETS_X.map((eyeOffsetX) => {
          const eyeX = faceX + eyeOffsetX;
          const towardFaceCenter = eyeOffsetX < 0 ? 1 : -1; // 左眼往右是 +1,右眼往左是 -1
          if (hasAccessory('shades')) return null;
          if (mood === 'lyingFlat') return <path key={eyeOffsetX} d={`M${eyeX - 4} ${faceY} q4 4 8 0`} />;
          if (mood === 'deflated') return <path key={eyeOffsetX} d={`M${eyeX - 4 * towardFaceCenter} ${faceY + 2} l${8 * towardFaceCenter} -3`} strokeWidth="2.4" />; // 垂眼:内高外低
          if (mood === 'breakdown') {
            // 😭:紧闭的眼 + 八字眉
            return (
              <g key={eyeOffsetX}>
                <path d={`M${eyeX - 5} ${faceY + 2} q5 -6 10 0`} strokeWidth="2.6" />
                <path d={`M${eyeX - 5 * towardFaceCenter} ${faceY - 4} l${10 * towardFaceCenter} -3`} strokeWidth="2" />
              </g>
            );
          }
          if (mood === 'disgusted') return <path key={eyeOffsetX} d={`M${eyeX - 4 * towardFaceCenter} ${faceY - 3} l${8 * towardFaceCenter} 3 l${-8 * towardFaceCenter} 3`} />;
          return (
            <g key={eyeOffsetX}>
              <circle cx={eyeX} cy={faceY} r="4.8" fill="#fff" strokeWidth="1.5" />
              <circle cx={eyeX + 0.6} cy={faceY + 0.6} r="2.7" fill={INK_COLOR} stroke="none" />
              <circle cx={eyeX + 1.5} cy={faceY - 0.7} r="0.9" fill="#fff" stroke="none" />
              {mood === 'sulky' && <path d={`M${eyeX - 6 * towardFaceCenter} ${faceY - 7} l${12 * towardFaceCenter} 4`} strokeWidth="2.4" />}
              {hasAccessory('makeup') && <path d={`M${eyeX + (eyeOffsetX < 0 ? -4 : 4)} ${faceY - 3} l${eyeOffsetX < 0 ? -3 : 3} -3`} />}
            </g>
          );
        })}
      </g>
      {hasAccessory('shades') && (
        <g fill="#1c1c28">
          <rect x={faceX - 16} y={faceY - 6} width="14" height="10" rx="3" />
          <rect x={faceX + 2} y={faceY - 6} width="14" height="10" rx="3" />
          <rect x={faceX - 3} y={faceY - 4} width="6" height="2" />
        </g>
      )}
      {CHEEK_OFFSETS_X.map((cheekOffsetX) => (
        <circle
          key={cheekOffsetX}
          cx={faceX + cheekOffsetX}
          cy={faceY + 6}
          r={mood === 'sulky' ? 5 : 3.2}
          fill={mood === 'disgusted' ? '#9acd6a' : '#ff8fa0'}
          opacity={hasAccessory('makeup') ? 0.9 : 0.55}
        />
      ))}
      <path
        d={mouthPath}
        fill={mood === 'disgusted' || mood === 'breakdown' ? '#6b2b2b' : hasLipstick ? '#e0394f' : 'none'}
        stroke={hasLipstick ? '#e0394f' : INK_COLOR}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {mood === 'lyingFlat' && <text x={faceX + 20} y={faceY - 12} fontSize="11" fontWeight="700" fill={INK_COLOR}>z</text>}
      {mood === 'sulky' && <path d={`M${faceX + 15} ${faceY - 20} l6 6 M${faceX + 21} ${faceY - 20} l-6 6`} stroke="#e0394f" strokeWidth="2.4" strokeLinecap="round" />}
      {mood === 'breakdown' && (
        <g fill="#7fc8f8" stroke={INK_COLOR} strokeWidth="1.2" strokeLinejoin="round">
          {TEAR_OFFSETS_X.map((tearOffsetX) => <path key={tearOffsetX} d={`M${faceX + tearOffsetX - 2} ${faceY + 4} q-5 9 -4 17 q9 2 10 -2 q-1 -9 -4 -15z`} />)}
          <ellipse cx={faceX} cy={faceY + 12} rx="4" ry="2.2" fill="#ff8fa0" stroke="none" />
        </g>
      )}
      {mood === 'deflated' && (
        <g>
          <path d={`M${faceX - 8} ${faceY - 15} v5 M${faceX} ${faceY - 16} v6 M${faceX + 8} ${faceY - 15} v5`} stroke="#6c7a96" strokeWidth="2" strokeLinecap="round" fill="none" />
          <g fill="#fff" stroke={INK_COLOR} strokeWidth="1.2">
            <circle cx={faceX + 11} cy={faceY + 14} r="2" />
            <circle cx={faceX + 16} cy={faceY + 11} r="2.8" />
            <circle cx={faceX + 22} cy={faceY + 8} r="3.6" />
          </g>
        </g>
      )}
      {mood === 'disgusted' && (
        <g fill="#9acd6a" stroke={INK_COLOR} strokeWidth="1.5">
          <path d={`M${faceX + 4} ${faceY + 11} q10 -2 16 4 q3 4 -1 7 q-8 -1 -15 -4z`} />
          <circle cx={faceX + 24} cy={faceY + 20} r="2" />
          <circle cx={faceX + 18} cy={faceY + 24} r="1.6" />
        </g>
      )}
    </>
  );
}
