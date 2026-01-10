import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CardModule } from './card/card.module';
import { GithubModule } from './github/github.module';
import { SvgModule } from './svg/svg.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes
    }),
    CardModule,
    GithubModule,
    SvgModule,
  ],
})
export class AppModule {}
