import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';
import { SvgService } from '../svg/svg.service';
import { CardConfigDto } from './dto/card-config.dto';

@Injectable()
export class CardService {
  constructor(
    private readonly githubService: GithubService,
    private readonly svgService: SvgService,
  ) {}

  async generateCard(config: CardConfigDto): Promise<string> {
    const stats = await this.githubService.getUserStats(config.username);
    return this.svgService.generateCard(stats, config);
  }

  generateErrorCard(message: string): string {
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
