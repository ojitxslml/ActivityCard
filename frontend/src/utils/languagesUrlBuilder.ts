import type { LanguagesConfig } from '../types/languages';

export const buildLanguagesUrl = (config: LanguagesConfig): string => {
  const baseUrl = `${import.meta.env.VITE_API_URL}/languages`;
  const params = new URLSearchParams();
  
  params.append('username', config.username);
  
  if (config.theme && config.theme !== 'custom') {
    params.append('theme', config.theme);
  }
  
  if (config.width) {
    params.append('width', config.width);
  }
  
  if (config.hide_border) {
    params.append('hide_border', 'true');
  }
  
  if (config.hide_title) {
    params.append('hide_title', 'true');
  }
  
  if (config.custom_title) {
    params.append('custom_title', config.custom_title);
  }
  
  // Custom colors (only if theme is custom)
  if (config.theme === 'custom') {
    if (config.bg_color) params.append('bg_color', config.bg_color.replace('#', ''));
    if (config.title_color) params.append('title_color', config.title_color.replace('#', ''));
    if (config.text_color) params.append('text_color', config.text_color.replace('#', ''));
    if (config.border_color) params.append('border_color', config.border_color.replace('#', ''));
  }
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateLanguagesMarkdown = (config: LanguagesConfig): string => {
  const url = buildLanguagesUrl(config);
  return `![Top Languages](${url})`;
};
