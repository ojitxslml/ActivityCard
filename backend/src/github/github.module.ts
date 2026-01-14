import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './github.service';
import { StreakService } from './streak.service';
import { LanguagesService } from './languages.service';

@Module({
  imports: [HttpModule],
  providers: [GithubService, StreakService, LanguagesService],
  exports: [GithubService, StreakService, LanguagesService],
})
export class GithubModule {}
