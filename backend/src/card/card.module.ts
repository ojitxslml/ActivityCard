import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { StreakController } from './streak.controller';
import { LanguagesController } from './languages.controller';
import { CardService } from './card.service';
import { GithubModule } from '../github/github.module';
import { SvgModule } from '../svg/svg.module';

@Module({
  imports: [GithubModule, SvgModule],
  controllers: [CardController, StreakController, LanguagesController],
  providers: [CardService],
})
export class CardModule {}
