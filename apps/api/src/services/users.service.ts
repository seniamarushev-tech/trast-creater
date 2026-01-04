import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { addDays, format } from '../utils/date';
import { OnboardingResult, Role } from '@trust/shared';

const ENTRY_STARS = 250;
const ENTRY_TAU = 250;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async onboard(tgId: string): Promise<OnboardingResult> {
    const expiresAt = addDays(new Date(), 30);
    const monthKey = format(expiresAt, 'yyyy-MM');

    const user = await this.prisma.user.upsert({
      where: { tgId },
      update: { trustAccessExpiresAt: expiresAt },
      create: { tgId, role: Role.FAN, trustAccessExpiresAt: expiresAt },
    });

    await this.prisma.starPayment.create({
      data: {
        userId: user.id,
        starsAmount: ENTRY_STARS,
        month: monthKey,
        status: 'PAID',
      },
    });

    // Reset allocations for the new period
    await this.prisma.trustAllocation.deleteMany({ where: { userId: user.id } });

    return { userId: user.id, expiresAt: expiresAt.toISOString(), tauAvailable: ENTRY_TAU };
  }

  async seedInfo() {
    const users = await this.prisma.user.findMany({ include: { allocations: true } });
    return { users };
  }
}
