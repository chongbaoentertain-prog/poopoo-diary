import { useState } from 'react';
import { Avatar } from './components/Avatar';
import { toDateKey } from './domain/date';
import { Calendar } from './features/calendar/Calendar';
import { Review } from './features/review/Review';
import { CheckInPanel } from './features/checkin/CheckInPanel';
import { Collection } from './features/collection/Collection';
import { Onboarding } from './features/onboarding/Onboarding';
import { ProfilePage } from './features/profile/ProfilePage';
import { useAppStore } from './store/useAppStore';

type Tab = 'home' | 'review' | 'collection' | 'me';
const TABS: [Tab, string, string][] = [
  ['home', '首页', 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10'],
  ['review', '回顾', 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['collection', '图鉴', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['me', '个人', 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0'],
];

export default function App() {
  const profile = useAppStore((s) => s.profile);
  const [selected, setSelected] = useState(toDateKey(new Date()));
  const [tab, setTab] = useState<Tab>('home');
  if (!profile) return <Onboarding />;

  return (
    <>
      <main className="mx-auto max-w-md space-y-4 p-4 pb-24">
        {tab === 'home' && (
          <>
            <header className="flex items-center gap-2">
              <button onClick={() => setTab('me')} aria-label="个人资料" className="flex items-center gap-2 rounded-full bg-porcelain py-1 pl-1 pr-4">
                <Avatar size={36} /><span className="font-semibold">{profile.anonymous || !profile.nickname ? '匿名噗友' : profile.nickname}</span>
              </button>
            </header>
            <CheckInPanel date={selected} />
            <Calendar selected={selected} onSelect={setSelected} />
          </>
        )}
        {tab === 'review' && <Review />}
        {tab === 'collection' && <Collection />}
        {tab === 'me' && <ProfilePage onPicked={() => { setSelected(toDateKey(new Date())); setTab('home'); }} />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-grout bg-porcelain pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map(([t, label, d]) => (
            <button key={t} aria-current={tab === t ? 'page' : undefined} onClick={() => setTab(t)}
              className={`flex items-center justify-center gap-1.5 py-3 text-sm ${tab === t ? 'border-t-2 border-gold bg-tile font-semibold text-brown' : 'border-t-2 border-transparent bg-porcelain'}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
