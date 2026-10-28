import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Navigation, TabId } from './Navigation';

interface LayoutProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  children,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-150 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar following 3-zone contract */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className={`text-sm sm:text-lg font-bold tracking-tight truncate min-w-0 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Interactive Continuous Distributions Lab
          </button>

          {/* Zone 2: Navigation Tabs (Desktop) */}
          <div className="hidden xl:block">
            <Navigation
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              theme={theme}
            />
          </div>

          {/* Zone 3: Theme Toggle Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Responsive Sub-row for Mobile / Tablet Navigation */}
        <div
          className={`xl:hidden border-t px-4 sm:px-6 py-2 ${
            isDark ? 'border-slate-800/60 bg-slate-900/50' : 'border-slate-200 bg-slate-100/60'
          }`}
        >
          <Navigation
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            theme={theme}
          />
        </div>
      </header>

      {/* Academic Lab Context Banner with Subtitle */}
      <div
        className={`border-b ${
          isDark
            ? 'bg-slate-900/40 border-slate-800/70'
            : 'bg-white border-slate-200/80'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p
            className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Explore probability distributions, sampling behaviour and statistical moments.
          </p>
          <div
            className={`flex items-center gap-2 text-xs font-mono ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}
          >
            <span>Program 3</span>
            <span aria-hidden="true">·</span>
            <span>Normal, Exponential, CLT &amp; Moments</span>
            <span aria-hidden="true">·</span>
            <span>Client-Side Numerical Engine</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Quiet Academic Footer */}
      <footer
        className={`border-t py-6 mt-12 text-xs ${
          isDark
            ? 'border-slate-800/80 text-slate-500 bg-slate-950'
            : 'border-slate-200 text-slate-500 bg-white'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Interactive Continuous Distributions Lab · Undergraduate Engineering Probability, Statistics &amp; AI/ML
          </div>
          <div className="flex items-center gap-3">
            <span>MIT License</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Mulberry32 PRNG</span>
            <span aria-hidden="true">·</span>
            <span>SciPy Fisher Kurtosis Convention</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
