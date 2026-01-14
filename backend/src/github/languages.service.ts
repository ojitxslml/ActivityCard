import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { TopLanguages, LanguageStats } from './interfaces/github.interface';

@Injectable()
export class LanguagesService {
  private readonly GITHUB_API = 'https://api.github.com';

  // GitHub language colors (standard colors from github-colors)
  private readonly LANGUAGE_COLORS: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Vue': '#41b883',
    'C': '#555555',
    'Objective-C': '#438eff',
    'Scala': '#c22d40',
  };

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTopLanguages(username: string, refresh = false, limit = 6): Promise<TopLanguages> {
    const cacheKey = `top_languages_${username}`;
    
    if (!refresh) {
      const cached = await this.cacheManager.get<TopLanguages>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const repos = await this.getUserRepos(username);
      const languageBytes: Record<string, number> = {};

      // Fetch languages for each repository
      for (const repo of repos) {
        if (repo.fork) continue; // Skip forked repos
        
        try {
          const languages = await this.getRepoLanguages(username, repo.name);
          
          for (const [lang, bytes] of Object.entries(languages)) {
            languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
          }
        } catch {
          // Skip repos that fail
          continue;
        }
      }

      // Calculate total bytes
      const totalBytes = Object.values(languageBytes).reduce((sum, bytes) => sum + bytes, 0);

      // Convert to LanguageStats array with percentages
      const languages: LanguageStats[] = Object.entries(languageBytes)
        .map(([name, bytes]) => ({
          name,
          bytes,
          percentage: (bytes / totalBytes) * 100,
          color: this.LANGUAGE_COLORS[name] || '#858585',
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, limit);

      const result: TopLanguages = {
        username,
        languages,
      };

      await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
      return result;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('GitHub user not found. Please check the username.', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch language data. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getUserRepos(username: string): Promise<Array<{ name: string; fork: boolean }>> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.GITHUB_API}/users/${username}/repos`, {
        params: { per_page: 100, sort: 'updated' },
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
        },
      })
    );
    return response.data;
  }

  private async getRepoLanguages(username: string, repo: string): Promise<Record<string, number>> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.GITHUB_API}/repos/${username}/${repo}/languages`, {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
        },
      })
    );
    return response.data;
  }
}
