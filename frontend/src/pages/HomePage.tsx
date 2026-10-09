import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Calendar } from '../features/calendar';
import { CheckInPanel } from '../features/checkin';
import { ShareScreen } from '../features/share';
import { CodeReminder } from '../features/sync';
import { useAppStore } from '../hooks/useAppStore';
import type { DateKey } from '../types/diary';

interface HomePageProps {
  selectedDate: DateKey;
  onSelectDate: (date: DateKey) => void;
  onOpenProfile: () => void;
}

/** 首页:顶部头像和分享入口,下面是签到面板和日历 */
export function HomePage({ selectedDate, onSelectDate, onOpenProfile }: HomePageProps) {
  const profile = useAppStore((state) => state.profile)!;
  const [isShareScreenOpen, setIsShareScreenOpen] = useState(false);

  return (
    <>
      <header className="flex items-center gap-2">
        <button onClick={onOpenProfile} aria-label="个人资料" className="flex items-center gap-2 rounded-full bg-porcelain py-1 pl-1 pr-4">
          <Avatar size={36} /><span className="font-semibold">{profile.anonymous || !profile.nickname ? '匿名噗友' : profile.nickname}</span>
        </button>
        <button onClick={() => setIsShareScreenOpen(true)} className="ml-auto rounded-full bg-porcelain px-4 py-2 text-sm font-semibold text-brown">分享</button>
      </header>
      <CodeReminder onGoToProfile={onOpenProfile} />
      <CheckInPanel date={selectedDate} />
      <Calendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
      {isShareScreenOpen && <ShareScreen selectedDate={selectedDate} onClose={() => setIsShareScreenOpen(false)} />}
    </>
  );
}
