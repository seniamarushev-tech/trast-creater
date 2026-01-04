import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const VELOCITY_WINDOW_DAYS = 7;
const VELOCITY_MULTIPLIER = 0.1;

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  async getChart() {
    const artists = await this.prisma.artist.findMany({
      include: { allocations: true },
      orderBy: { trustScore: 'desc' },
    });

    const chart = await Promise.all(
      artists.map(async (artist, index) => {
        const velocity = await this.computeVelocity(artist.id, artist.trustScore);
        const rank = index + 1;
        return {
          id: artist.id,
          name: artist.name,
          trustScore: artist.trustScore,
          trustVelocity: velocity,
          trustRank: rank,
        };
      }),
    );

    return { chart };
  }

  async computeVelocity(artistId: number, trustScore: number) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - VELOCITY_WINDOW_DAYS);
    const historical = await this.prisma.chart.findFirst({
      where: { artistId, date: { lte: sevenDaysAgo } },
      orderBy: { date: 'desc' },
    });
    const previousScore = historical?.trustScore ?? 0;
    return trustScore - previousScore;
  }

  rewardWeight(trustScore: number, velocity: number) {
    return trustScore * (1 + velocity * VELOCITY_MULTIPLIER);
  }
}
