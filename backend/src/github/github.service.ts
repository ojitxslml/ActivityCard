import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { GitHubUser, GitHubRepo, UserStats } from './interfaces/github.interface';

@Injectable()
export class GithubService {
  private readonly GITHUB_API = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserStats(username: string, refresh = false): Promise<UserStats> {
    const cacheKey = `user_stats_${username}`;
    
    if (!refresh) {
      const cached = await this.cacheManager.get<UserStats>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const user = await this.getUser(username);
      const repos = await this.getUserRepos(username);
      
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalCommits = await this.getTotalCommits(username);
      const totalPRs = await this.getTotalPRs(username);
      const totalIssues = await this.getTotalIssues(username);
      
      const stats: UserStats = {
        username: user.login,
        name: user.name || user.login,
        totalStars,
        totalCommits,
        totalPRs,
        totalIssues,
        contributedTo: repos.length,
        rank: this.calculateRank(totalStars, totalCommits, totalPRs, totalIssues),
      };

      await this.cacheManager.set(cacheKey, stats, 300000); // 5 minutes
      return stats;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('GitHub user not found. Please check the username.', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch GitHub data. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getUser(username: string): Promise<GitHubUser> {
    const response = await firstValueFrom(
      this.httpService.get<GitHubUser>(`${this.GITHUB_API}/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
        },
      })
    );
    return response.data;
  }

  private async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const response = await firstValueFrom(
      this.httpService.get<GitHubRepo[]>(`${this.GITHUB_API}/users/${username}/repos`, {
        params: { per_page: 100, sort: 'updated' },
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
        },
      })
    );
    return response.data;
  }

  private async getTotalCommits(username: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GITHUB_API}/search/commits`, {
          params: { q: `author:${username}`, per_page: 1 },
          headers: { 
            Accept: 'application/vnd.github.cloak-preview',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
          }
        })
      );
      return response.data.total_count || 0;
    } catch {
      return 0;
    }
  }

  private async getTotalPRs(username: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GITHUB_API}/search/issues`, {
          params: { q: `author:${username} type:pr`, per_page: 1 },
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
          },
        })
      );
      return response.data.total_count || 0;
    } catch {
      return 0;
    }
  }

  private async getTotalIssues(username: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GITHUB_API}/search/issues`, {
          params: { q: `author:${username} type:issue`, per_page: 1 },
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
          },
        })
      );
      return response.data.total_count || 0;
    } catch {
      return 0;
    }
  }

  private calculateRank(stars: number, commits: number, prs: number, issues: number): string {
    const score = stars * 2 + commits * 0.5 + prs * 3 + issues * 1;
    
    if (score >= 1000) return 'S';
    if (score >= 500) return 'A+';
    if (score >= 200) return 'A';
    if (score >= 100) return 'B+';
    if (score >= 50) return 'B';
    return 'C';
  }
}
