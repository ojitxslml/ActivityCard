import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { CardService } from './card.service';
import type { CardConfigDto } from './dto/card-config.dto';

@Controller('api')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('card')
  async getCard(@Query() config: CardConfigDto, @Res() res: Response) {
    try {
      const svg = await this.cardService.generateCard(config);
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(HttpStatus.OK).send(svg);
    } catch (error) {
      const errorSvg = this.cardService.generateErrorCard(error.message);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send(errorSvg);
    }
  }
}
