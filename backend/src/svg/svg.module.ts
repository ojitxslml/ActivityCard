import { Module } from '@nestjs/common';
import { SvgService } from './svg.service';
import { StreakSvgService } from './streak-svg.service';

@Module({
  providers: [SvgService, StreakSvgService],
  exports: [SvgService, StreakSvgService],
})
export class SvgModule {}
