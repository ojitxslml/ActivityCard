import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Download } from 'lucide-react';
import type { CardConfig } from '../types';
import type { StreakConfig } from '../types/streak';
import { buildStatsUrl, generateMarkdown } from '../utils/urlBuilder';
import { buildStreakUrl, generateStreakMarkdown } from '../utils/streakUrlBuilder';

interface PreviewPanelProps {
  config: CardConfig | StreakConfig;
  isStreak?: boolean;
  refreshKey?: number;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config, isStreak = false, refreshKey = 0 }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset error when url changes
  const url = isStreak 
    ? buildStreakUrl(config as StreakConfig)
    : buildStatsUrl(config as CardConfig);
    
  // Add refresh param for preview only
  const displayUrl = refreshKey > 0 
    ? `${url}&refresh=true&_t=${Date.now()}` // Add simple timestamp to force browser reload
    : url;

  React.useEffect(() => {
     setImgError(false);
  }, [displayUrl]);

  const markdown = isStreak
    ? generateStreakMarkdown(config as StreakConfig)
    : generateMarkdown(config as CardConfig);

  const copyToClipboard = async (text: string, setFn: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="panel" style={{ height: '100%', justifyContent: 'center' }}>
      <div className="preview-area">
        {config.username ? (
          !imgError ? (
            <img 
              src={displayUrl} 
              alt={isStreak ? "GitHub Streak" : "GitHub Stats"}
              onError={() => setImgError(true)}
              style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', borderRadius: '4px' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#ef4444' }}>
              <p style={{ fontWeight: 600 }}>Failed to load {isStreak ? 'streak' : 'stats'} card</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                The external service might be down or the username is invalid.
              </p>
              <button className="btn btn-secondary" onClick={() => setImgError(false)} style={{ marginTop: '1rem' }}>
                Retry
              </button>
            </div>
          )
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            <p>Enter a GitHub username to see the {isStreak ? 'streak' : 'stats'} card.</p>
          </div>
        )}
      </div>

      {config.username && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn" onClick={() => copyToClipboard(markdown, setCopiedMd)}>
              {copiedMd ? <Check size={18} /> : <Copy size={18} />}
              {copiedMd ? 'Copied Markdown' : 'Copy Markdown'}
            </button>
            <button className="btn btn-secondary" onClick={() => copyToClipboard(url, setCopiedUrl)}>
              {copiedUrl ? <Check size={18} /> : <ExternalLink size={18} />}
              {copiedUrl ? 'Copied URL' : 'Copy URL'}
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              <Download size={18} /> Open SVG
            </a>
          </div>
          
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.85rem' }}>{markdown}</code>
          </div>
        </div>
      )}
    </div>
  );
};
