import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { StreakStats, ContributionDay } from './interfaces/streak.interface';

@Injectable()
export class StreakService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStreakStats(username: string): Promise<StreakStats> {
    const cacheKey = `streak_stats_${username}`;
    const cached = await this.cacheManager.get<StreakStats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const contributions = await this.getContributions(username);
    const stats = this.calculateStreaks(username, contributions);
    
    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, stats, 300000);
    
    return stats;
  }

  async getContributions(username: string): Promise<ContributionDay[]> {
    const cacheKey = `contributions_${username}`;
    const cached = await this.cacheManager.get<ContributionDay[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const contributions = await this.fetchContributions(username);
    
    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, contributions, 300000);
    
    return contributions;
  }

  private async fetchContributions(username: string): Promise<ContributionDay[]> {
    // GitHub GraphQL API only returns last year by default
    // We need to fetch multiple years to handle long streaks
    const currentYear = new Date().getFullYear();
    const startYear = 2020; // Fetch from 2020 onwards to capture very long streaks
    
    try {
      // Create all requests to execute in parallel
      const yearRequests: Promise<any>[] = [];
      
      for (let year = startYear; year <= currentYear; year++) {
        const fromDate = `${year}-01-01T00:00:00Z`;
        const toDate = year === currentYear 
          ? new Date().toISOString() 
          : `${year}-12-31T23:59:59Z`;
        
        const query = `
          query($username: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $username) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
              }
            }
          }
        `;

        // Add promise to array (don't await yet)
        yearRequests.push(
          firstValueFrom(
            this.httpService.post(
              'https://api.github.com/graphql',
              { 
                query, 
                variables: { 
                  username, 
                  from: fromDate, 
                  to: toDate 
                } 
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
                },
              },
            ),
          )
        );
      }

      // Execute all requests in parallel
      const responses = await Promise.all(yearRequests);
      
      // Process all responses
      const allDays: ContributionDay[] = [];
      responses.forEach(response => {
        const user = response.data?.data?.user;
        
        // Check if user exists
        if (!user) {
          throw new Error('User not found');
        }
        
        const weeks = user?.contributionsCollection?.contributionCalendar?.weeks;
        
        if (weeks) {
          weeks.forEach((week: any) => {
            week.contributionDays.forEach((day: any) => {
              allDays.push({
                date: day.date,
                count: day.contributionCount,
              });
            });
          });
        }
      });

      // Remove duplicates and sort
      const uniqueDays = Array.from(
        new Map(allDays.map(day => [day.date, day])).values()
      );

      return uniqueDays.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      // Check if it's a user not found error
      if (error.message === 'User not found' || error.response?.status === 404) {
        throw new Error(`GitHub user not found. Please check the username.`);
      }
      
      console.error('Error fetching contributions:', error.response?.data || error.message);
      throw new Error('Failed to fetch GitHub data. Please try again later.');
    }
  }

  private calculateStreaks(username: string, contributions: ContributionDay[]): StreakStats {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalContributions = 0;
    
    let currentStreakStart = '';
    let currentStreakEnd = '';
    let longestStreakStart = '';
    let longestStreakEnd = '';
    let tempStreakStart = '';
    let tempStreakEnd = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate total contributions
    totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
    
    // Sort contributions by date (oldest first for easier processing)
    const sortedContribs = [...contributions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sortedContribs.length === 0) {
      return {
        username,
        currentStreak: 0,
        longestStreak: 0,
        totalContributions: 0,
        firstContribution: '',
        currentStreakStart: '',
        currentStreakEnd: '',
        longestStreakStart: '',
        longestStreakEnd: '',
      };
    }

    // Calculate current streak (must include today or yesterday)
    // Work backwards from today
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Build a map for quick lookup
    const contribMap = new Map<string, number>();
    sortedContribs.forEach(c => contribMap.set(c.date, c.count));
    
    // Check if today or yesterday has contributions
    const todayContrib = contribMap.get(todayStr) || 0;
    const yesterdayContrib = contribMap.get(yesterdayStr) || 0;
    
    if (todayContrib > 0 || yesterdayContrib > 0) {
      // Start from today or yesterday
      let checkDate = todayContrib > 0 ? new Date(today) : new Date(yesterday);
      currentStreakEnd = checkDate.toISOString().split('T')[0];
      
      // Count backwards
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const count = contribMap.get(dateStr) || 0;
        
        if (count > 0) {
          currentStreak++;
          currentStreakStart = dateStr;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 0;
    tempStreakStart = '';
    tempStreakEnd = '';
    
    for (let i = 0; i < sortedContribs.length; i++) {
      const contrib = sortedContribs[i];
      
      if (contrib.count > 0) {
        if (tempStreak === 0) {
          tempStreakStart = contrib.date;
        }
        tempStreak++;
        tempStreakEnd = contrib.date;
        
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakStart = tempStreakStart;
          longestStreakEnd = tempStreakEnd;
        }
      } else {
        // Only reset streak if we're sure there's a gap (consecutive day with 0)
        if (i > 0) {
          const prevDate = new Date(sortedContribs[i - 1].date);
          const currDate = new Date(contrib.date);
          const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            // Consecutive day with no contributions, reset streak
            tempStreak = 0;
            tempStreakStart = '';
          }
        }
      }
    }

    return {
      username,
      currentStreak,
      longestStreak,
      totalContributions,
      firstContribution: sortedContribs[0]?.date || '',
      currentStreakStart: currentStreakStart || currentStreakEnd,
      currentStreakEnd: currentStreakEnd || currentStreakStart,
      longestStreakStart,
      longestStreakEnd,
    };
  }

  private generateMockContributions(): ContributionDay[] {
    const days: ContributionDay[] = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      days.push({
        date: date.toISOString().split('T')[0],
        count: Math.random() > 0.3 ? Math.floor(Math.random() * 10) : 0,
      });
    }
    
    return days;
  }
}
