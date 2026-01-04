import { Module } from '@nestjs/common';
import { ArtistsController } from '../routes/artists.controller';
import { ArtistsService } from '../services/artists.service';
import { UsersModule } from './users.module';

@Module({
  imports: [UsersModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
