import { useState, useEffect } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewPanel } from './components/PreviewPanel';
import type { CardConfig } from './types';
import type { StreakConfig } from './types/streak';
import type { LanguagesConfig } from './types/languages';
import { Github } from 'lucide-react';
import { saveStatsConfig, loadStatsConfig, saveStreakConfig, loadStreakConfig, saveLanguagesConfig, loadLanguagesConfig } from './utils/localStorage';

type TabType = 'stats' | 'streak' | 'languages';

const defaultStatsConfig: CardConfig = {
  username: '',
  theme: 'default',
  hide_border: true,
  show_icons: true,
  hide_rank: false,
  hide_title: false,
  include_all_commits: true,
  count_private: true,
  hide: [],
  bg_color: '#1a1b27',
  title_color: '#0bc1d9',
  text_color: '#a9b1d6',
  icon_color: '#89ddff',
  border_color: '#0bc1d9',
};

const defaultStreakConfig: StreakConfig = {
  username: '',
  theme: 'default',
  hide_border: true,
  hide_title: false,
  bg_color: '#1a1b27',
  stroke_color: '#0bc1d9',
  ring_color: '#89ddff',
  fire_color: 'fb8c00',
  curr_streak_color: '#0bc1d9',
  longest_streak_color: '#89ddff',
};

const defaultLanguagesConfig: LanguagesConfig = {
  username: '',
  theme: 'default',
  hide_border: true,
  hide_title: false,
  bg_color: '#1a1b27',
  title_color: '#0bc1d9',
  text_color: '#a9b1d6',
  border_color: '#0bc1d9',
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  
  // Load configs from localStorage or use defaults
  const [statsConfig, setStatsConfig] = useState<CardConfig>(() => {
    const saved = loadStatsConfig();
    return saved || defaultStatsConfig;
  });

  const [streakConfig, setStreakConfig] = useState<StreakConfig>(() => {
    const saved = loadStreakConfig();
    return saved || defaultStreakConfig;
  });

  const [languagesConfig, setLanguagesConfig] = useState<LanguagesConfig>(() => {
    const saved = loadLanguagesConfig();
    return saved || defaultLanguagesConfig;
  });

  // Save to localStorage whenever configs change
  useEffect(() => {
    saveStatsConfig(statsConfig);
  }, [statsConfig]);

  useEffect(() => {
    saveStreakConfig(streakConfig);
  }, [streakConfig]);

  useEffect(() => {
    saveLanguagesConfig(languagesConfig);
  }, [languagesConfig]);

  // Sync username and theme between configs when switching tabs
  const handleTabChange = (newTab: TabType) => {
    const currentConfig = activeTab === 'stats' ? statsConfig : activeTab === 'streak' ? streakConfig : languagesConfig;
    
    if (newTab === 'streak') {
      const updates: Partial<StreakConfig> = {};
      if (currentConfig.username !== streakConfig.username) updates.username = currentConfig.username;
      if (currentConfig.theme !== streakConfig.theme) updates.theme = currentConfig.theme;
      if (Object.keys(updates).length > 0) setStreakConfig({ ...streakConfig, ...updates });
    } else if (newTab === 'stats') {
      const updates: Partial<CardConfig> = {};
      if (currentConfig.username !== statsConfig.username) updates.username = currentConfig.username;
      if (currentConfig.theme !== statsConfig.theme) updates.theme = currentConfig.theme;
      if (Object.keys(updates).length > 0) setStatsConfig({ ...statsConfig, ...updates });
    } else if (newTab === 'languages') {
      const updates: Partial<LanguagesConfig> = {};
      if (currentConfig.username !== languagesConfig.username) updates.username = currentConfig.username;
      if (currentConfig.theme !== languagesConfig.theme) updates.theme = currentConfig.theme;
      if (Object.keys(updates).length > 0) setLanguagesConfig({ ...languagesConfig, ...updates });
    }
    setActiveTab(newTab);
  };

  // Refresh state to force update image
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="layout">
      {/* Header Panel */}
      <div className="header-panel">
        <div className="panel" style={{ flex: '0 0 auto', padding: '0.875rem' }}>
          <h1 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            <Github size={24} color="var(--accent)" />
            Activity Card Gen
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Customize and generate your GitHub profile readme cards.
          </p>
          
          {/* Tabs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.5rem', 
            marginTop: '0.75rem' 
          }}>
            <button 
              className={activeTab === 'stats' ? 'btn' : 'btn btn-secondary'}
              onClick={() => handleTabChange('stats')}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            >
              Stats Card
            </button>
            <button 
              className={activeTab === 'streak' ? 'btn' : 'btn btn-secondary'}
              onClick={() => handleTabChange('streak')}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            >
              Streak Card
            </button>
            <button 
              className={activeTab === 'languages' ? 'btn' : 'btn btn-secondary'}
              onClick={() => handleTabChange('languages')}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            >
              Languages Card
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel - Shows first on mobile (order: 1) */}
      <div className="preview-container">
        <PreviewPanel 
          config={activeTab === 'stats' ? statsConfig : activeTab === 'streak' ? streakConfig : languagesConfig} 
          isStreak={activeTab === 'streak'}
          isLanguages={activeTab === 'languages'}
          refreshKey={refreshKey}
        />
      </div>

      {/* Config Panel - Shows second on mobile (order: 2) */}
      <div className="config-container">
        {activeTab === 'stats' ? (
          <ConfigPanel 
            config={statsConfig} 
            onChange={(newConfig) => setStatsConfig(newConfig as CardConfig)}
            onRefresh={handleRefresh}
          />
        ) : activeTab === 'streak' ? (
          <ConfigPanel 
            config={streakConfig} 
            onChange={(newConfig) => setStreakConfig(newConfig as StreakConfig)} 
            isStreak 
            onRefresh={handleRefresh}
          />
        ) : (
          <ConfigPanel 
            config={languagesConfig} 
            onChange={(newConfig) => setLanguagesConfig(newConfig as LanguagesConfig)} 
            isLanguages 
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
}

export default App;
