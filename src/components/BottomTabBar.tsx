import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Music, 
  Mic2, 
  Users 
} from 'lucide-react';

interface BottomTabBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingConfirmationsCount?: number;
  isLeanMode?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  pendingConfirmationsCount = 0,
  isLeanMode = false,
}) => {
  const tabs = isLeanMode
    ? [
        { id: 'dashboard', label: 'Meu Culto', icon: LayoutDashboard },
        { id: 'songs', label: 'Repertório', icon: Music },
        { id: 'stage', label: 'Púlpito', icon: Mic2, special: true },
        { id: 'schedule', label: 'Escalas', icon: Calendar, badge: pendingConfirmationsCount },
      ]
    : [
        { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
        { id: 'schedule', label: 'Escalas', icon: Calendar, badge: pendingConfirmationsCount },
        { id: 'songs', label: 'Músicas', icon: Music },
        { id: 'stage', label: 'Púlpito', icon: Mic2, special: true },
        { id: 'members', label: 'Equipe', icon: Users },
      ];

  const gridColsClass = isLeanMode ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <nav 
      aria-label="Navegação inferior mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden shadow-lg transition-colors"
    >
      <div className={`grid ${gridColsClass} h-16 max-w-md mx-auto px-2`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center relative py-1 transition-transform active:scale-95 ${
                isActive 
                  ? 'text-teal-600 dark:text-teal-400 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 tracking-tight truncate max-w-full ${isActive ? 'font-black' : 'font-semibold'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
