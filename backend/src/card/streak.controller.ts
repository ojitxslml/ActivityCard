import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { StreakService } from '../github/streak.service';
import { StreakSvgService } from '../svg/streak-svg.service';

@Controller('api')
export class StreakController {
  constructor(
    private readonly streakService: StreakService,
    private readonly streakSvgService: StreakSvgService,
  ) {}

  @Get('streak')
  async getStreak(
    @Query('username') username: string,
    @Query('refresh') refresh: string,
    @Query('date_range_years') dateRangeYears: string,
    @Query() config: any,
    @Res() res: Response,
  ) {
    try {
      if (!username) {
        throw new Error('Username is required');
      }

      const shouldRefresh = refresh === 'true';
      const years = dateRangeYears ? parseInt(dateRangeYears, 10) : 1;
      
      // Get stats with contributions included (optimized - no double fetch)
      const stats = await this.streakService.getStreakStats(username, shouldRefresh, years, true);
      
      // Pass date_range_years to the SVG service
      const configWithYears = { ...config, date_range_years: years };
      const svg = this.streakSvgService.generateStreakCard(
        stats, 
        configWithYears, 
        stats.contributions || []
      );

      res.setHeader('Content-Type', 'image/svg+xml');
      // Improved cache headers for GitHub's CDN
      // max-age=300 (5 min), stale-while-revalidate=3600 (1 hour)
      // This allows GitHub to serve stale content while revalidating in background
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
      res.status(HttpStatus.OK).send(svg);
    } catch (error) {
      const width = config.width === 'wide' ? 854 : 495;
      const errorSvg = this.generateErrorCard(error.message, width);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorSvg);
    }
  }

  private generateErrorCard(message: string, width: number = 495): string {
    const centerX = width / 2;
    return `
<svg width="${width}" height="195" viewBox="0 0 ${width} 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .error-title { font: 700 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #e74c3c; }
    .error-msg { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #7f8c8d; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="${width - 1}" fill="#fffbfb" />
  
  <!-- Error Icon -->
  <g transform="translate(${centerX}, 50)">
    <circle r="25" fill="#e74c3c" opacity="0.1"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" style="font-size: 40px; fill: #e74c3c;">⚠</text>
  </g>
  
  <!-- Error Message -->
  <g transform="translate(${centerX}, 110)">
    <text x="0" y="0" text-anchor="middle" class="error-title">Error</text>
    <text x="0" y="25" text-anchor="middle" class="error-msg">${message}</text>
  </g>
</svg>`.trim();
  }
}
