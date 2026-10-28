/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TabId } from './components/Navigation';
import { Overview } from './modules/Overview';
import { NormalDistribution } from './modules/NormalDistribution';
import { ExponentialDistribution } from './modules/ExponentialDistribution';
import { CLTSimulation } from './modules/CLTSimulation';
import { MomentsAnalysis } from './modules/MomentsAnalysis';
import { About } from './modules/About';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    >
      {activeTab === 'overview' && (
        <Overview onSelectTab={setActiveTab} theme={theme} />
      )}
      {activeTab === 'normal' && <NormalDistribution theme={theme} />}
      {activeTab === 'exponential' && <ExponentialDistribution theme={theme} />}
      {activeTab === 'clt' && <CLTSimulation theme={theme} />}
      {activeTab === 'moments' && <MomentsAnalysis theme={theme} />}
      {activeTab === 'about' && <About theme={theme} />}
    </Layout>
  );
}
