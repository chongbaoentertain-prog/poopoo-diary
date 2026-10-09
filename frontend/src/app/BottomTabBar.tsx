export type TabId = 'home' | 'review' | 'collection' | 'profile';

interface TabDefinition {
  id: TabId;
  label: string;
  iconPath: string; // 24×24 画布里的 SVG 路径
}

const TABS: TabDefinition[] = [
  { id: 'home', label: '首页', iconPath: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { id: 'review', label: '回顾', iconPath: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { id: 'collection', label: '图鉴', iconPath: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { id: 'profile', label: '个人', iconPath: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0' },
];

interface BottomTabBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-grout bg-porcelain pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => (
          <button key={tab.id} aria-current={activeTab === tab.id ? 'page' : undefined} onClick={() => onSelectTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 py-3 text-sm ${activeTab === tab.id ? 'border-t-2 border-gold bg-tile font-semibold text-brown' : 'border-t-2 border-transparent bg-porcelain'}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={tab.iconPath} /></svg>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
