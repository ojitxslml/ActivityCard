import type { CardConfig } from '../types';

export function buildStatsUrl(config: CardConfig): string {
  const baseUrl = "http://localhost:3000/api/card";
  const params = new URLSearchParams();

  if (config.username) params.append("username", config.username);
  if (config.theme && config.theme !== 'custom') params.append("theme", config.theme);
  
  if (config.hide_border) params.append("hide_border", "true");
  if (config.show_icons) params.append("show_icons", "true");
  if (config.hide_rank) params.append("hide_rank", "true");
  if (config.hide_title) params.append("hide_title", "true");
  if (config.include_all_commits) params.append("include_all_commits", "true");
  if (config.count_private) params.append("count_private", "true");
  
  if (config.hide && config.hide.length > 0) {
    params.append("hide", config.hide.join(","));
  }

  if (config.custom_title) params.append("custom_title", config.custom_title);
  if (config.line_height && config.line_height !== 25) params.append("line_height", config.line_height.toString());

  // Custom Colors
  if (config.theme === 'custom') {
    if (config.bg_color) params.append("bg_color", config.bg_color.replace('#', ''));
    if (config.title_color) params.append("title_color", config.title_color.replace('#', ''));
    if (config.text_color) params.append("text_color", config.text_color.replace('#', ''));
    if (config.icon_color) params.append("icon_color", config.icon_color.replace('#', ''));
    if (config.border_color) params.append("border_color", config.border_color.replace('#', ''));
  }

  return `${baseUrl}?${params.toString()}`;
}

export function generateMarkdown(config: CardConfig): string {
  const url = buildStatsUrl(config);
  return `![${config.username}'s GitHub stats](${url})`;
}
