import { BadRequestException, Injectable } from '@nestjs/common';
import { AllocationInput, TrustSummary } from '@trust/shared';
import { PrismaService } from './prisma.service';
import { addDays } from '../utils/date';

const TAU_PER_ENTRY = 250;
const MAX_REALLOCATIONS_PER_DAY = 5;

@Injectable()
export class TrustService {
  constructor(private readonly prisma: PrismaService) {}

  async allocate(tgId: string, allocations: AllocationInput[]) {
    const user = await this.prisma.user.findUnique({ where: { tgId }, include: { allocations: true } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.trustAccessExpiresAt || user.trustAccessExpiresAt < new Date()) {
      throw new BadRequestException('Access expired');
    }

    const total = allocations.reduce((sum, a) => sum + a.tau, 0);
    if (total !== TAU_PER_ENTRY) {
      throw new BadRequestException('Allocations must equal 250 TAU');
    }

    const today = addDays(new Date(), 0).toDateString();
    const recentChanges = user.allocations.filter((a) => new Date(a.updatedAt).toDateString() === today).length;
    if (recentChanges >= MAX_REALLOCATIONS_PER_DAY) {
      throw new BadRequestException('Reallocation limit reached');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const allocation of user.allocations) {
        await tx.artist.update({
          where: { id: allocation.artistId },
          data: { trustScore: { decrement: allocation.tauAmount } },
        });
      }
      await tx.trustAllocation.deleteMany({ where: { userId: user.id } });
      for (const allocation of allocations) {
        await tx.trustAllocation.create({ data: { userId: user.id, artistId: allocation.artistId, tauAmount: allocation.tau } });
        await tx.artist.update({
          where: { id: allocation.artistId },
          data: {
            trustScore: {
              increment: allocation.tau,
            },
          },
        });
      }
    });

    return { status: 'ok' };
  }

  async summary(tgId: string): Promise<TrustSummary> {
    const user = await this.prisma.user.findUnique({ where: { tgId } });
    if (!user || !user.trustAccessExpiresAt) {
      throw new BadRequestException('User not found');
    }
    const allocations = await this.prisma.trustAllocation.findMany({ where: { userId: user.id } });
    const tauRemaining = TAU_PER_ENTRY - allocations.reduce((sum, a) => sum + a.tauAmount, 0);
    return {
      expiresAt: user.trustAccessExpiresAt.toISOString(),
      tauRemaining,
      allocations: allocations.map((a) => ({ artistId: a.artistId, tau: a.tauAmount })),
    };
  }
}
