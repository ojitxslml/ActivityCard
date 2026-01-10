import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './github.service';
import { StreakService } from './streak.service';

@Module({
  imports: [HttpModule],
  providers: [GithubService, StreakService],
  exports: [GithubService, StreakService],
})
export class GithubModule {}
