import { Injectable } from '@nestjs/common';
import { StreakStats } from '../github/interfaces/streak.interface';
import { THEMES } from './themes';

interface StreakConfig {
  theme?: string;
  hide_border?: boolean;
  hide_title?: boolean;
  bg_color?: string;
  stroke_color?: string;
  ring_color?: string;
  fire_color?: string;
  curr_streak_color?: string;
  longest_streak_color?: string;
}

@Injectable()
export class StreakSvgService {
  generateStreakCard(stats: StreakStats, config: StreakConfig, contributions?: any[]): string {
    const theme = this.getTheme(config);
    const width = 495;
    const baseHeight = config.hide_title ? 165 : 195;
    const height = baseHeight + 100;
    const titleOffset = config.hide_title ? 0 : 30;

    // Use real contributions if provided, otherwise generate mock data
    const contribData = contributions && contributions.length > 0 
      ? contributions 
      : this.generateMockContributions();

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.stroke_color}; }
    .stat-value { font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.curr_streak_color}; }
    .stat-label { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.stroke_color}; }
    .date-text { font: 400 9px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.stroke_color}; opacity: 0.7; }
    .section-title { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${theme.stroke_color}; }
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
    stroke="#${theme.stroke_color}" 
    width="${width - 1}" 
    fill="#${theme.bg_color}" 
    stroke-opacity="${config.hide_border ? '0' : '1'}"
  />
  
  ${!config.hide_title ? `
  <!-- Title -->
  <g transform="translate(25, 30)">
    <text x="0" y="0" class="header">${stats.username}'s GitHub Streak</text>
  </g>
  ` : ''}
  
  <!-- Stats Container -->
  <g transform="translate(${width / 2}, ${65 + titleOffset})">
    <!-- Total Contributions -->
    <g transform="translate(-155, 0)" class="stagger">
      <circle cx="0" cy="0" r="40" fill="#${theme.ring_color}" opacity="0.2" filter="url(#shadow)"/>
      <text x="0" y="5" text-anchor="middle" dominant-baseline="middle" class="stat-value">
        ${this.formatNumber(stats.totalContributions)}
      </text>
      <text x="0" y="50" text-anchor="middle" class="stat-label">Total Contributions</text>
      <text x="0" y="63" text-anchor="middle" class="date-text">${this.formatDate(stats.firstContribution)} - Present</text>
    </g>
    
    <!-- Current Streak -->
    <g transform="translate(0, 0)" class="stagger" style="animation-delay: 150ms">
      <circle cx="0" cy="0" r="55" fill="#${theme.fire_color}" opacity="0.2" filter="url(#shadow)"/>
      ${this.getFireBackground(theme.fire_color)}
      <text x="0" y="15" text-anchor="middle" dominant-baseline="middle" class="stat-value">
        ${stats.currentStreak}
      </text>
      <text x="0" y="70" text-anchor="middle" class="stat-label">Current Streak</text>
      <text x="0" y="83" text-anchor="middle" class="date-text">${this.formatDateRange(stats.currentStreakStart, stats.currentStreakEnd)}</text>
    </g>
    
    <!-- Longest Streak -->
    <g transform="translate(155, 0)" class="stagger" style="animation-delay: 300ms">
      <circle cx="0" cy="0" r="40" fill="#${theme.longest_streak_color}" opacity="0.2" filter="url(#shadow)"/>
      <text x="0" y="5" text-anchor="middle" dominant-baseline="middle" class="stat-value" fill="#${theme.longest_streak_color}">
        ${stats.longestStreak}
      </text>
      <text x="0" y="50" text-anchor="middle" class="stat-label">Longest Streak</text>
      <text x="0" y="63" text-anchor="middle" class="date-text">${this.formatDateRange(stats.longestStreakStart, stats.longestStreakEnd)}</text>
    </g>
  </g>
  
  ${this.generateContributionGraph(contribData, theme, 175 + titleOffset, width)}
</svg>`.trim();
  }

  private getFireIcon(x: number, y: number, color: string): string {
    return `
    <path
      transform="translate(${x - 12}, ${y - 12}) scale(1)"
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
      fill="#${color}"
      stroke="#${color}"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />`;
  }

  private getFireBackground(color: string): string {
    return `
    <g transform="scale(4.2) translate(-12, -10.2)">
      <path 
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" 
        fill="#${color}" 
        fill-opacity="0.1"
        stroke="#${color}"
        stroke-width="0.4" 
        stroke-opacity="0.4"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </g>`;
  }

  private generateMockContributions(): any[] {
    const contributions: any[] = [];
    const today = new Date();
    
    for (let i = 371; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: Math.random() > 0.3 ? Math.floor(Math.random() * 12) : 0,
      });
    }
    
    return contributions;
  }

  private generateContributionGraph(contributions: any[], theme: any, yOffset: number, width: number): string {
    const weeks = this.groupContributionsByWeek(contributions);
    const cellSize = 6;
    const cellGap = 2;
    const graphWidth = weeks.length * (cellSize + cellGap);
    const startX = (width - graphWidth) / 2; // Center the graph
    
    let svg = `<g transform="translate(0, ${yOffset})">`;
    svg += `<text x="${width / 2}" y="0" text-anchor="middle" class="section-title">Contribution Activity</text>`;
    
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const x = startX + weekIndex * (cellSize + cellGap);
        const y = 20 + dayIndex * (cellSize + cellGap);
        const level = this.getContributionLevel(day.count);
        const color = this.getContributionColor(level, theme);
        
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#${color}" rx="1"/>`;
      });
    });
    
    svg += '</g>';
    return svg;
  }

  private groupContributionsByWeek(contributions: any[]): any[][] {
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    // Start from Sunday
    const firstDate = new Date(contributions[0]?.date || new Date());
    const firstDayOfWeek = firstDate.getDay();
    
    // Fill empty days at the beginning
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0 });
    }
    
    contributions.forEach((contrib) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(contrib);
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks.slice(-53); // Last 53 weeks
  }

  private getContributionLevel(count: number): number {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 9) return 3;
    return 4;
  }

  private getContributionColor(level: number, theme: any): string {
    const baseColor = theme.ring_color;
    const isDark = theme.bg_color !== 'ffffff';
    
    const colors = {
      0: isDark ? '2d333b' : 'ebedf0',
      1: baseColor + '40',
      2: baseColor + '80',
      3: baseColor + 'c0',
      4: baseColor,
    };
    return colors[level] || colors[0];
  }

  private getTheme(config: StreakConfig): any {
    const baseTheme = config.theme && THEMES[config.theme] ? THEMES[config.theme] : THEMES.default;
    
    return {
      bg_color: config.bg_color || baseTheme.bg_color,
      stroke_color: config.stroke_color || baseTheme.title_color,
      ring_color: config.ring_color || baseTheme.icon_color,
      fire_color: config.fire_color || 'fb8c00',
      curr_streak_color: config.curr_streak_color || baseTheme.title_color,
      longest_streak_color: config.longest_streak_color || baseTheme.icon_color,
    };
  }

  private formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private formatDateRange(start: string, end: string): string {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }


}
