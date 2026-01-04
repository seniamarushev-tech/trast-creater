import { Module } from '@nestjs/common';
import { TrustController } from '../routes/trust.controller';
import { TrustService } from '../services/trust.service';
import { UsersModule } from './users.module';
import { ArtistsModule } from './artists.module';

@Module({
  imports: [UsersModule, ArtistsModule],
  controllers: [TrustController],
  providers: [TrustService],
})
export class TrustModule {}
