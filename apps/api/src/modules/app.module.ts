import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users.module';
import { ArtistsModule } from './artists.module';
import { TrustModule } from './trust.module';
import { HealthModule } from './health.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, ArtistsModule, TrustModule, HealthModule],
})
export class AppModule {}
