import { Injectable } from '@nestjs/common';
import { UserStats } from '../github/interfaces/github.interface';
import { CardConfigDto } from '../card/dto/card-config.dto';
import { THEMES } from './themes';

@Injectable()
export class SvgService {
  generateCard(stats: UserStats, config: CardConfigDto): string {
    const theme = this.getTheme(config);
    const hiddenStats = config.hide ? config.hide.split(',') : [];
    
    // Convert string booleans to actual booleans (query params arrive as strings)
    const hideRank = this.toBoolean(config.hide_rank);
    const hideTitle = this.toBoolean(config.hide_title);
    const hideBorder = this.toBoolean(config.hide_border);
    const showIcons = this.toBoolean(config.show_icons, true);
    const includeAllCommits = this.toBoolean(config.include_all_commits, true);
    
    const width = 495;
    // Adjust height based on visibility options
    let height = 195;
    if (hideRank && hideTitle) height = 135;
    else if (hideRank || hideTitle) height = 165;
    
    const statsHtml = this.generateStatsHtml(stats, config, hiddenStats, theme, showIcons, includeAllCommits);
    const titleOffset = hideTitle ? 0 : 30;
    const statsOffset = hideTitle ? 30 : 60;
    
    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title_color}; }
    .stat-label { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.text_color}; }
    .stat-value { font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.title_color}; }
    .stagger { opacity: 0; animation: fadeInAnimation 0.3s ease-in-out forwards; }
    @keyframes fadeInAnimation {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>
  
  <rect 
    data-testid="card-bg" 
    x="0.5" 
    y="0.5" 
    rx="4.5" 
    height="99%" 
    stroke="#${theme.border_color}" 
    width="${width - 1}" 
    fill="#${theme.bg_color}" 
    stroke-opacity="${hideBorder ? '0' : '1'}"
  />
  
  ${!hideTitle ? `<g transform="translate(25, 30)">
    <text x="0" y="0" class="header">${config.custom_title || `${stats.name}'s GitHub Stats`}</text>
  </g>` : ''}
  
  <g transform="translate(0, ${statsOffset})">
    ${statsHtml}
  </g>
  
  ${!hideRank ? this.generateRankCircle(stats.rank, theme, width) : ''}
</svg>`.trim();
  }

  private toBoolean(value: any, defaultValue = false): boolean {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value;
  }

  private generateStatsHtml(stats: UserStats, config: CardConfigDto, hiddenStats: string[], theme: any, showIcons: boolean, includeAllCommits: boolean): string {
    const statsToShow: Array<{ label: string; value: string | number; icon: string }> = [];
    
    if (!hiddenStats.includes('stars')) {
      statsToShow.push({ label: 'Total Stars', value: stats.totalStars, icon: this.getStarIcon(theme.icon_color) });
    }
    if (!hiddenStats.includes('commits')) {
      statsToShow.push({ label: 'Total Commits', value: includeAllCommits ? stats.totalCommits : `${stats.totalCommits} (2024)`, icon: this.getCommitIcon(theme.icon_color) });
    }
    if (!hiddenStats.includes('prs')) {
      statsToShow.push({ label: 'Total PRs', value: stats.totalPRs, icon: this.getPRIcon(theme.icon_color) });
    }
    if (!hiddenStats.includes('issues')) {
      statsToShow.push({ label: 'Total Issues', value: stats.totalIssues, icon: this.getIssueIcon(theme.icon_color) });
    }
    if (!hiddenStats.includes('contribs')) {
      statsToShow.push({ label: 'Contributed to', value: stats.contributedTo, icon: this.getRepoIcon(theme.icon_color) });
    }

    const itemsPerRow = 2;
    const rows = Math.ceil(statsToShow.length / itemsPerRow);
    let html = '';
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index >= statsToShow.length) break;
        
        const stat = statsToShow[index];
        const x = col === 0 ? 30 : 260;
        const y = 15 + row * 35;
        
        html += `
    <g transform="translate(${x}, ${y})" class="stagger" style="animation-delay: ${index * 150}ms">
      ${showIcons ? `<g transform="translate(0, -8)">${stat.icon}</g>` : ''}
      <text class="stat-label" x="${showIcons ? '22' : '0'}" y="0">${stat.label}:</text>
      <text class="stat-value" x="${showIcons ? '22' : '0'}" y="14">${stat.value}</text>
    </g>`;
      }
    }
    
    return html;
  }

  private generateRankCircle(rank: string, theme: any, cardWidth: number): string {
    return `
  <g transform="translate(${cardWidth - 65}, 50)">
    <circle cx="0" cy="0" r="40" stroke="#${theme.border_color}" stroke-width="1" fill="#${theme.bg_color}" opacity="0.8"/>
    <text x="0" y="2" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="26" font-weight="700" fill="#${theme.title_color}">
      ${rank}
    </text>
    <text x="0" y="24" text-anchor="middle" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="11" font-weight="600" fill="#${theme.text_color}">
      Rank
    </text>
  </g>`;
  }

  private getTheme(config: CardConfigDto): any {
    if (config.theme && config.theme !== 'custom' && THEMES[config.theme]) {
      return THEMES[config.theme];
    }
    
    return {
      bg_color: config.bg_color || 'ffffff',
      title_color: config.title_color || '2f80ed',
      text_color: config.text_color || '434d58',
      icon_color: config.icon_color || '4c71f2',
      border_color: config.border_color || 'e4e2e2',
    };
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

  private getStarIcon(color: string): string {
    return `<svg x="0" y="0" width="16" height="16" viewBox="0 0 16 16" fill="#${color}"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>`;
  }

  private getCommitIcon(color: string): string {
    return `<svg x="0" y="0" width="16" height="16" viewBox="0 0 16 16" fill="#${color}"><path fill-rule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"/></svg>`;
  }

  private getPRIcon(color: string): string {
    return `<svg x="0" y="0" width="16" height="16" viewBox="0 0 16 16" fill="#${color}"><path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/></svg>`;
  }

  private getIssueIcon(color: string): string {
    return `<svg x="0" y="0" width="16" height="16" viewBox="0 0 16 16" fill="#${color}"><path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/></svg>`;
  }

  private getRepoIcon(color: string): string {
    return `<svg x="0" y="0" width="16" height="16" viewBox="0 0 16 16" fill="#${color}"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/></svg>`;
  }
}
