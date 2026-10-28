import React from 'react';

export type TabId =
  | 'overview'
  | 'normal'
  | 'exponential'
  | 'clt'
  | 'moments'
  | 'about';

export interface NavItem {
  id: TabId;
  label: string;
  shortLabel: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
  { id: 'normal', label: 'Normal Distribution', shortLabel: 'Normal' },
  { id: 'exponential', label: 'Exponential Distribution', shortLabel: 'Exponential' },
  { id: 'clt', label: 'Central Limit Theorem', shortLabel: 'CLT' },
  { id: 'moments', label: 'Moments Analysis', shortLabel: 'Moments' },
  { id: 'about', label: 'About', shortLabel: 'About' },
];

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  theme: 'dark' | 'light';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <nav
      aria-label="Primary lab modules"
      className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(item.id)}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${
              isActive
                ? isDark
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-sky-600 text-white shadow-xs'
                : isDark
                  ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
