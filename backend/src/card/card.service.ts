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
