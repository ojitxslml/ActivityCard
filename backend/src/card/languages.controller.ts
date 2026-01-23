import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { LanguagesService } from '../github/languages.service';
import { LanguagesSvgService } from '../svg/languages-svg.service';

@Controller('api')
export class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly languagesSvgService: LanguagesSvgService,
  ) {}

  @Get('languages')
  async getLanguages(
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
      const data = await this.languagesService.getTopLanguages(username, shouldRefresh);
      const svg = this.languagesSvgService.generateLanguagesCard(data, config);

      res.setHeader('Content-Type', 'image/svg+xml');
      // Improved cache headers for GitHub's CDN
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
<svg width="${width}" height="230" viewBox="0 0 ${width} 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .error-title { font: 700 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #e74c3c; }
    .error-msg { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #7f8c8d; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="${width - 1}" fill="#fffbfb" />
  
  <!-- Error Icon -->
  <g transform="translate(${centerX}, 70)">
    <circle r="25" fill="#e74c3c" opacity="0.1"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" style="font-size: 40px; fill: #e74c3c;">⚠</text>
  </g>
  
  <!-- Error Message -->
  <g transform="translate(${centerX}, 130)">
    <text x="0" y="0" text-anchor="middle" class="error-title">Error</text>
    <text x="0" y="25" text-anchor="middle" class="error-msg">${message}</text>
  </g>
</svg>`.trim();
  }
}
