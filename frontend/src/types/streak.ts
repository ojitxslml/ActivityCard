export interface StreakConfig {
  username: string;
  theme?: string;
  hide_border?: boolean;
  hide_title?: boolean;
  bg_color?: string;
  stroke_color?: string;
  ring_color?: string;
  fire_color?: string;
  curr_streak_color?: string;
  longest_streak_color?: string;
  width?: 'normal' | 'wide';
  date_range_years?: number;
}
