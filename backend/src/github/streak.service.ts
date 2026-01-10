import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { StreakStats, ContributionDay } from './interfaces/streak.interface';

@Injectable()
export class StreakService {
  constructor(private readonly httpService: HttpService) {}

  async getStreakStats(username: string): Promise<StreakStats> {
    const contributions = await this.getContributions(username);
    return this.calculateStreaks(username, contributions);
  }

  async getContributions(username: string): Promise<ContributionDay[]> {
    return this.fetchContributions(username);
  }

  private async fetchContributions(username: string): Promise<ContributionDay[]> {
    // GitHub GraphQL query to get contribution calendar
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
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

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.github.com/graphql',
          { query, variables: { username } },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
            },
          },
        ),
      );

      const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;
      const days: ContributionDay[] = [];

      weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
          days.push({
            date: day.date,
            count: day.contributionCount,
          });
        });
      });

      return days;
    } catch (error) {
      console.error('Error fetching contributions:', error.response?.data || error.message);
      // Fallback: generate mock data for demonstration
      return this.generateMockContributions();
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort contributions by date (newest first)
    const sortedContribs = [...contributions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak (from today backwards)
    let streakBroken = false;
    for (let i = 0; i < sortedContribs.length; i++) {
      const contrib = sortedContribs[i];
      const contribDate = new Date(contrib.date);
      contribDate.setHours(0, 0, 0, 0);
      
      totalContributions += contrib.count;
      
      if (contrib.count > 0) {
        if (!streakBroken) {
          if (currentStreak === 0) {
            currentStreakEnd = contrib.date;
          }
          currentStreak++;
          currentStreakStart = contrib.date;
        }
      } else {
        streakBroken = true;
      }
    }

    // Calculate longest streak
    tempStreak = 0;
    for (const contrib of contributions) {
      if (contrib.count > 0) {
        if (tempStreak === 0) {
          tempStreakStart = contrib.date;
        }
        tempStreak++;
        
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakStart = tempStreakStart;
          longestStreakEnd = contrib.date;
        }
      } else {
        tempStreak = 0;
      }
    }

    return {
      username,
      currentStreak,
      longestStreak,
      totalContributions,
      firstContribution: contributions[0]?.date || '',
      currentStreakStart,
      currentStreakEnd,
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
