export interface CardConfig {
  username: string;
  theme: string;
  hide_border: boolean;
  show_icons: boolean;
  hide_rank: boolean;
  hide_title: boolean;
  include_all_commits: boolean;
  count_private: boolean;
  hide: string[]; // ['stars', 'commits', 'prs', 'issues', 'contribs']
  custom_title?: string;
  line_height?: number;
  bg_color?: string;
  title_color?: string;
  text_color?: string;
  icon_color?: string;
  border_color?: string;
  width?: 'normal' | 'wide';
}

export const AVAILABLE_THEMES = [
  "default", "dark", "radical", "merko", "gruvbox", "tokyonight", "onedark", "cobalt", "synthwave", "highcontrast", "dracula",
  "prussian", "monokai", "vue", "vue-dark", "shades-of-purple", "nightowl", "buefy", "blue-green", "algolia", "great-gatsby",
  "darcula", "bear", "solarized-dark", "solarized-light", "chartreuse-dark", "nord", "gotham", "material-palenight", "graywhite",
  "vision-friendly-dark", "ayu-mirage", "midnight-purple", "calm", "flag-india", "omni", "react", "jolly", "maroongold",
  "yeblu", "blueberry", "slateorange", "kacho_ga"
];


