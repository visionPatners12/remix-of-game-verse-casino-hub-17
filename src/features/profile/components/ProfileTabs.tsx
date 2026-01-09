import { useTranslation } from 'react-i18next';

export type TabType = 'posts' | 'bets' | 'predictions';

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMobile?: boolean;
}

const tabKeys: TabType[] = ['posts', 'bets', 'predictions'];

export function ProfileTabs({ activeTab, onTabChange, isMobile = false }: ProfileTabsProps) {
  const { t } = useTranslation('profile');

  return (
    <div className={`sticky ${isMobile ? 'top-0' : 'top-14'} z-20 bg-background/95 backdrop-blur-sm border-none`}>
      <div className="px-1">
        <nav className="flex justify-center">
          <div className="flex space-x-6">
            {tabKeys.map((key) => (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`py-3 border-b-2 ${
                  activeTab === key
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground font-medium'
                } text-xs tracking-wider uppercase transition-colors`}
              >
                {t(`tabs.${key}`)}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}