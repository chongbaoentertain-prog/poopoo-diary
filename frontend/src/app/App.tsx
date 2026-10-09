import { useState } from 'react';
import { toDateKey } from '../domain/date';
import { useAppStore } from '../hooks/useAppStore';
import { CollectionPage } from '../pages/CollectionPage';
import { HomePage } from '../pages/HomePage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ReviewPage } from '../pages/ReviewPage';
import { BottomTabBar, type TabId } from './BottomTabBar';

/** 应用外壳:还没选过角色就走引导页,否则按底部标签切换四个页面 */
export default function App() {
  const hasCompletedOnboarding = useAppStore((state) => state.profile !== null);
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [activeTab, setActiveTab] = useState<TabId>('home');
  if (!hasCompletedOnboarding) return <OnboardingPage />;

  const goToHomeOnToday = () => {
    setSelectedDate(toDateKey(new Date()));
    setActiveTab('home');
  };

  return (
    <>
      <main className="mx-auto max-w-md space-y-4 p-4 pb-24">
        {activeTab === 'home' && <HomePage selectedDate={selectedDate} onSelectDate={setSelectedDate} onOpenProfile={() => setActiveTab('profile')} />}
        {activeTab === 'review' && <ReviewPage />}
        {activeTab === 'collection' && <CollectionPage />}
        {activeTab === 'profile' && <ProfilePage onNewCharacterChosen={goToHomeOnToday} />}
      </main>
      <BottomTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </>
  );
}
