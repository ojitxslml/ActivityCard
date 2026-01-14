import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Layout, EyeOff, FileCode, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import type { CardConfig } from '../types';
import type { StreakConfig } from '../types/streak';

interface ConfigPanelProps {
  config: CardConfig | StreakConfig;
  onChange: (newConfig: CardConfig | StreakConfig) => void;
  isStreak?: boolean;
  onRefresh?: () => void;
}

// ... existing ColorInput ...
const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="control-group">
      <div className="label">{label}</div>
      <div className="color-picker-wrapper">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div 
            style={{ 
              width: '36px', 
              height: '36px', 
              background: value, 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        {showPicker && (
          <div style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0, marginTop: '8px' }}>
            <div style={{ position: 'fixed', inset: 0 }} onClick={() => setShowPicker(false)} />
            <div style={{ position: 'relative' }}>
              <HexColorPicker color={value} onChange={onChange} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOpen ? '1rem' : 0, color: 'var(--text-primary)', fontWeight: 600 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={18} /> {title}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>}
    </div>
  );
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, isStreak = false, onRefresh }) => {
  
  const update = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const toggleHide = (stat: string) => {
    if ('hide' in config) {
      const newHide = config.hide.includes(stat) 
        ? config.hide.filter((s: string) => s !== stat)
        : [...config.hide, stat];
      update('hide', newHide);
    }
  };

  const getTheme = () => config.theme || 'default';
  
  const getColorValue = (key: string, defaultValue: string) => {
    return (config as any)[key] || defaultValue;
  };

  return (
    <div className="panel" style={{ flex: 1, minHeight: 0 }}>
      <div className="panel-content">
        <Section title="Core Settings" icon={Layout}>
          <div className="control-group">
            <label className="label">GitHub Username</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={config.username} 
                onChange={(e) => update('username', e.target.value)} 
                placeholder="your-username"
                style={{ flex: 1 }}
              />
              {onRefresh && (
                <button 
                  className="btn btn-secondary" 
                  onClick={onRefresh}
                  title="Refresh data from GitHub"
                  style={{ padding: '0 0.75rem' }}
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="control-group">
            <label className="label">Card Width</label>
            <select 
              value={config.width || 'normal'} 
              onChange={(e) => update('width', e.target.value as 'normal' | 'wide')}
            >
              <option value="normal">Normal (495px)</option>
              <option value="wide">Wide (854px)</option>
            </select>
          </div>
          {!isStreak && (
            <div className="control-group">
              <label className="label">Card Title (Optional)</label>
              <input 
                type="text" 
                value={'custom_title' in config ? config.custom_title || '' : ''} 
                onChange={(e) => update('custom_title', e.target.value)} 
                placeholder="Leave empty for default"
              />
            </div>
          )}
        </Section>

        <Section title="Appearance" icon={Palette}>
          <div className="control-group">
            <label className="label">Theme</label>
            <select value={getTheme()} onChange={(e) => update('theme', e.target.value)}>
               <option value="custom">Custom Colors</option>
               <optgroup label="Light Themes">
                 <option value="default">default</option>
                 <option value="vue">vue</option>
                 <option value="buefy">buefy</option>
                 <option value="solarized-light">solarized-light</option>
                 <option value="graywhite">graywhite</option>
                 <option value="flag-india">flag-india</option>
                 <option value="jolly">jolly</option>
                 <option value="maroongold">maroongold</option>
               </optgroup>
               <optgroup label="Dark Themes">
                 <option value="dark">dark</option>
                 <option value="radical">radical</option>
                 <option value="merko">merko</option>
                 <option value="gruvbox">gruvbox</option>
                 <option value="tokyonight">tokyonight</option>
                 <option value="onedark">onedark</option>
                 <option value="cobalt">cobalt</option>
                 <option value="synthwave">synthwave</option>
                 <option value="highcontrast">highcontrast</option>
                 <option value="dracula">dracula</option>
                 <option value="prussian">prussian</option>
                 <option value="monokai">monokai</option>
                 <option value="vue-dark">vue-dark</option>
                 <option value="shades-of-purple">shades-of-purple</option>
                 <option value="nightowl">nightowl</option>
                 <option value="blue-green">blue-green</option>
                 <option value="algolia">algolia</option>
                 <option value="great-gatsby">great-gatsby</option>
                 <option value="darcula">darcula</option>
                 <option value="bear">bear</option>
                 <option value="solarized-dark">solarized-dark</option>
                 <option value="chartreuse-dark">chartreuse-dark</option>
                 <option value="nord">nord</option>
                 <option value="gotham">gotham</option>
                 <option value="material-palenight">material-palenight</option>
                 <option value="vision-friendly-dark">vision-friendly-dark</option>
                 <option value="ayu-mirage">ayu-mirage</option>
                 <option value="midnight-purple">midnight-purple</option>
                 <option value="calm">calm</option>
                 <option value="omni">omni</option>
                 <option value="react">react</option>
                 <option value="yeblu">yeblu</option>
                 <option value="blueberry">blueberry</option>
                 <option value="slateorange">slateorange</option>
                 <option value="kacho_ga">kacho_ga</option>
               </optgroup>
            </select>
          </div>

          {getTheme() === 'custom' && (
            <div style={{ display: 'grid', gap: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
              <ColorInput label="Background" value={getColorValue('bg_color', '#000000')} onChange={(v) => update('bg_color', v)} />
              {isStreak ? (
                <>
                  <ColorInput label="Stroke Color" value={getColorValue('stroke_color', '#ffffff')} onChange={(v) => update('stroke_color', v)} />
                  <ColorInput label="Ring Color" value={getColorValue('ring_color', '#4c71f2')} onChange={(v) => update('ring_color', v)} />
                  <ColorInput label="Fire Color" value={getColorValue('fire_color', '#fb8c00')} onChange={(v) => update('fire_color', v)} />
                  <ColorInput label="Current Streak" value={getColorValue('curr_streak_color', '#ffffff')} onChange={(v) => update('curr_streak_color', v)} />
                  <ColorInput label="Longest Streak" value={getColorValue('longest_streak_color', '#4c71f2')} onChange={(v) => update('longest_streak_color', v)} />
                </>
              ) : (
                <>
                  <ColorInput label="Title Color" value={getColorValue('title_color', '#ffffff')} onChange={(v) => update('title_color', v)} />
                  <ColorInput label="Text Color" value={getColorValue('text_color', '#999999')} onChange={(v) => update('text_color', v)} />
                  <ColorInput label="Icon Color" value={getColorValue('icon_color', '#4c2889')} onChange={(v) => update('icon_color', v)} />
                  <ColorInput label="Border Color" value={getColorValue('border_color', '#333333')} onChange={(v) => update('border_color', v)} />
                </>
              )}
            </div>
          )}

          {!isStreak && (
            <>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={'show_icons' in config ? config.show_icons : true} onChange={(e) => update('show_icons', e.target.checked)} />
                <span>Show Icons</span>
              </label>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={!config.hide_border} onChange={(e) => update('hide_border', !e.target.checked)} />
                <span>Show Border</span>
              </label>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={'hide_rank' in config ? !config.hide_rank : true} onChange={(e) => update('hide_rank', !e.target.checked)} />
                <span>Show Rank</span>
              </label>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={'hide_title' in config ? !config.hide_title : true} onChange={(e) => update('hide_title', !e.target.checked)} />
                <span>Show Title</span>
              </label>
            </>
          )}
          
          {isStreak && (
            <>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={!config.hide_border} onChange={(e) => update('hide_border', !e.target.checked)} />
                <span>Show Border</span>
              </label>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={'hide_title' in config ? !config.hide_title : true} onChange={(e) => update('hide_title', !e.target.checked)} />
                <span>Show Title</span>
              </label>
            </>
          )}
        </Section>

        {!isStreak && (
          <>
            <Section title="Stats Visibility" icon={EyeOff} defaultOpen={false}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['stars', 'commits', 'prs', 'issues', 'contribs'].map(stat => (
                  <label key={stat} className="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      checked={'hide' in config ? !config.hide.includes(stat) : true} 
                      onChange={() => toggleHide(stat)} 
                    />
                    <span style={{ textTransform: 'capitalize' }}>{stat}</span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Advanced" icon={FileCode} defaultOpen={false}>
                <label className="checkbox-wrapper">
                  <input type="checkbox" checked={'include_all_commits' in config ? config.include_all_commits : true} onChange={(e) => update('include_all_commits', e.target.checked)} />
                  <span>Include All Commits (Lifetime)</span>
                </label>
                <label className="checkbox-wrapper">
                  <input type="checkbox" checked={'count_private' in config ? config.count_private : true} onChange={(e) => update('count_private', e.target.checked)} />
                  <span>Count Private Contributions</span>
                </label>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
