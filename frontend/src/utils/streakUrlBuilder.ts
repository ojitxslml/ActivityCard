import type { StreakConfig } from '../types/streak';

export function buildStreakUrl(config: StreakConfig): string {
  const baseUrl = "http://localhost:3000/api/streak";
  const params = new URLSearchParams();

  if (config.username) params.append("username", config.username);
  if (config.theme && config.theme !== 'custom') params.append("theme", config.theme);
  if (config.hide_border) params.append("hide_border", "true");
  if (config.hide_title) params.append("hide_title", "true");
  
  // Only send custom colors if theme is 'custom'
  if (config.theme === 'custom') {
    if (config.bg_color) params.append("bg_color", config.bg_color.replace('#', ''));
    if (config.stroke_color) params.append("stroke_color", config.stroke_color.replace('#', ''));
    if (config.ring_color) params.append("ring_color", config.ring_color.replace('#', ''));
    if (config.fire_color) params.append("fire_color", config.fire_color.replace('#', ''));
    if (config.curr_streak_color) params.append("curr_streak_color", config.curr_streak_color.replace('#', ''));
    if (config.longest_streak_color) params.append("longest_streak_color", config.longest_streak_color.replace('#', ''));
  }

  return `${baseUrl}?${params.toString()}`;
}

export function generateStreakMarkdown(config: StreakConfig): string {
  const url = buildStreakUrl(config);
  return `![${config.username}'s GitHub Streak](${url})`;
}
