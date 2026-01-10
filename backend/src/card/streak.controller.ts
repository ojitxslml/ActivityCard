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
    @Query() config: any,
    @Res() res: Response,
  ) {
    try {
      if (!username) {
        throw new Error('Username is required');
      }

      const shouldRefresh = refresh === 'true';
      const stats = await this.streakService.getStreakStats(username, shouldRefresh);
      const contributions = await this.streakService.getContributions(username, shouldRefresh);
      const svg = this.streakSvgService.generateStreakCard(stats, config, contributions);

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(HttpStatus.OK).send(svg);
    } catch (error) {
      const errorSvg = this.generateErrorCard(error.message);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorSvg);
    }
  }

  private generateErrorCard(message: string): string {
    return `
<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .error-title { font: 700 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #e74c3c; }
    .error-msg { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #7f8c8d; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="494" fill="#fffbfb" />
  
  <!-- Error Icon -->
  <g transform="translate(247.5, 50)">
    <circle r="25" fill="#e74c3c" opacity="0.1"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" style="font-size: 40px; fill: #e74c3c;">⚠</text>
  </g>
  
  <!-- Error Message -->
  <g transform="translate(247.5, 110)">
    <text x="0" y="0" text-anchor="middle" class="error-title">Error</text>
    <text x="0" y="25" text-anchor="middle" class="error-msg">${message}</text>
  </g>
</svg>`.trim();
  }
}
