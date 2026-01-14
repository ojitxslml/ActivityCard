import { Module } from '@nestjs/common';
import { SvgService } from './svg.service';
import { StreakSvgService } from './streak-svg.service';
import { LanguagesSvgService } from './languages-svg.service';

@Module({
  providers: [SvgService, StreakSvgService, LanguagesSvgService],
  exports: [SvgService, StreakSvgService, LanguagesSvgService],
})
export class SvgModule {}
