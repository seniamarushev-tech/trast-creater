import { Controller, Get } from '@nestjs/common';
import { ArtistsService } from '../services/artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get('chart')
  async chart() {
    return this.artistsService.getChart();
  }
}
