export interface ContributionDay {
  date: string;
  count: number;
}

export interface StreakStats {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  firstContribution: string;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreakStart: string;
  longestStreakEnd: string;
  contributions?: ContributionDay[]; // Optional: to avoid double fetching
}
