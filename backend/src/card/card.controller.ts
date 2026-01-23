import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { CardService } from './card.service';
import type { CardConfigDto } from './dto/card-config.dto';

@Controller('api')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('card')
  async getCard(
    @Query() config: CardConfigDto,
    @Query('refresh') refresh: string,
    @Res() res: Response,
  ) {
    try {
      const svg = await this.cardService.generateCard(config, refresh === 'true');
      
      res.setHeader('Content-Type', 'image/svg+xml');
      // Improved cache headers for GitHub's CDN
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=43200');
      res.status(HttpStatus.OK).send(svg);
    } catch (error) {
      const width = config.width === 'wide' ? 854 : 495;
      const errorSvg = this.cardService.generateErrorCard(error.message, width);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send(errorSvg);
    }
  }
}
