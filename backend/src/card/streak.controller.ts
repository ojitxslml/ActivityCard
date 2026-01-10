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
    @Query() config: any,
    @Res() res: Response,
  ) {
    try {
      if (!username) {
        throw new Error('Username is required');
      }

      const stats = await this.streakService.getStreakStats(username);
      const contributions = await this.streakService.getContributions(username);
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
<svg width="495" height="120" viewBox="0 0 495 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .error { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #e74c3c; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="494" fill="#ffffff" />
  <g transform="translate(25, 35)">
    <text x="0" y="0" class="error">Error: ${message}</text>
  </g>
</svg>`.trim();
  }
}
