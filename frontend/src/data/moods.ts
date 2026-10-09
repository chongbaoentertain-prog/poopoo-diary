import type { Mood } from '../types/character';

export interface MoodOption {
  id: Mood;
  label: string;
}

/** 签到时让用户选的今日心情,按从好到坏排列 */
export const MOODS: MoodOption[] = [
  { id: 'refreshed', label: '舒畅' },
  { id: 'calm', label: '淡定' },
  { id: 'lyingFlat', label: '躺平' },
  { id: 'sulky', label: '憋屈' },
  { id: 'deflated', label: '泄气' },
  { id: 'disgusted', label: '嫌弃' },
  { id: 'breakdown', label: '崩溃' },
];

export const DEFAULT_MOOD: Mood = 'refreshed';

export const getMoodLabel = (mood: Mood): string => MOODS.find((option) => option.id === mood)?.label ?? '';
