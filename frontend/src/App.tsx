import { useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewPanel } from './components/PreviewPanel';
import type { CardConfig } from './types';
import type { StreakConfig } from './types/streak';
import { Github } from 'lucide-react';

type TabType = 'stats' | 'streak';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  
  const [statsConfig, setStatsConfig] = useState<CardConfig>({
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
  });

  const [streakConfig, setStreakConfig] = useState<StreakConfig>({
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
  });

  // Sync username and theme between configs when switching tabs
  const handleTabChange = (newTab: TabType) => {
    if (newTab === 'streak') {
      const updates: Partial<StreakConfig> = {};
      if (statsConfig.username !== streakConfig.username) {
        updates.username = statsConfig.username;
      }
      if (statsConfig.theme !== streakConfig.theme) {
        updates.theme = statsConfig.theme;
      }
      if (Object.keys(updates).length > 0) {
        setStreakConfig({ ...streakConfig, ...updates });
      }
    } else if (newTab === 'stats') {
      const updates: Partial<CardConfig> = {};
      if (streakConfig.username !== statsConfig.username) {
        updates.username = streakConfig.username;
      }
      if (streakConfig.theme !== statsConfig.theme) {
        updates.theme = streakConfig.theme;
      }
      if (Object.keys(updates).length > 0) {
        setStatsConfig({ ...statsConfig, ...updates });
      }
    }
    setActiveTab(newTab);
  };

  return (
    <div className="layout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        <div className="panel" style={{ flex: '0 0 auto', padding: '1rem' }}>
          <h1 className="panel-title" style={{ fontSize: '1.5rem' }}>
            <Github size={28} color="var(--accent)" />
            Activity Card Gen
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Customize and generate your GitHub profile readme cards.
          </p>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className={activeTab === 'stats' ? 'btn' : 'btn btn-secondary'}
              onClick={() => handleTabChange('stats')}
            >
              Stats Card
            </button>
            <button 
              className={activeTab === 'streak' ? 'btn' : 'btn btn-secondary'}
              onClick={() => handleTabChange('streak')}
            >
              Streak Card
            </button>
          </div>
        </div>
        
        <div style={{ flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'stats' ? (
            <ConfigPanel 
              config={statsConfig} 
              onChange={(newConfig) => setStatsConfig(newConfig as CardConfig)} 
            />
          ) : (
            <ConfigPanel 
              config={streakConfig} 
              onChange={(newConfig) => setStreakConfig(newConfig as StreakConfig)} 
              isStreak 
            />
          )}
        </div>
      </div>

      <PreviewPanel 
        config={activeTab === 'stats' ? statsConfig : streakConfig} 
        isStreak={activeTab === 'streak'}
      />
    </div>
  );
}

export default App;
