import type { CardConfig } from '../types';
import type { StreakConfig } from '../types/streak';
import type { LanguagesConfig } from '../types/languages';

const STATS_CONFIG_KEY = 'activitycard_stats_config';
const STREAK_CONFIG_KEY = 'activitycard_streak_config';
const LANGUAGES_CONFIG_KEY = 'activitycard_languages_config';

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

export const saveLanguagesConfig = (config: LanguagesConfig): void => {
  try {
    localStorage.setItem(LANGUAGES_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save languages config to localStorage:', error);
  }
};

export const loadLanguagesConfig = (): LanguagesConfig | null => {
  try {
    const saved = localStorage.getItem(LANGUAGES_CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load languages config from localStorage:', error);
    return null;
  }
};
