import type { CardConfig } from '../types';
import type { StreakConfig } from '../types/streak';

const STATS_CONFIG_KEY = 'activitycard_stats_config';
const STREAK_CONFIG_KEY = 'activitycard_streak_config';

export const saveStatsConfig = (config: CardConfig): void => {
  try {
    localStorage.setItem(STATS_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save stats config to localStorage:', error);
  }
};

export const loadStatsConfig = (): CardConfig | null => {
  try {
    const saved = localStorage.getItem(STATS_CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load stats config from localStorage:', error);
    return null;
  }
};

export const saveStreakConfig = (config: StreakConfig): void => {
  try {
    localStorage.setItem(STREAK_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save streak config to localStorage:', error);
  }
};

export const loadStreakConfig = (): StreakConfig | null => {
  try {
    const saved = localStorage.getItem(STREAK_CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load streak config from localStorage:', error);
    return null;
  }
};
