import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.trustAllocation.deleteMany();
  await prisma.artistReward.deleteMany();
  await prisma.chart.deleteMany();
  await prisma.starPayment.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  const fans = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.create({
        data: {
          tgId: `fan_${i + 1}`,
          role: Role.FAN,
          trustAccessExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      }),
    ),
  );

  const artists = await Promise.all(
    Array.from({ length: 5 }).map((_, i) => {
      return prisma.user.create({
        data: {
          tgId: `artist_${i + 1}`,
          role: Role.ARTIST,
          trustAccessExpiresAt: null,
          allocations: { create: [] },
          starPayments: { create: [] },
        },
      });
    }),
  );

  const artistRows = await Promise.all(
    artists.map((user, idx) =>
      prisma.artist.create({
        data: {
          userId: user.id,
          name: `Artist ${idx + 1}`,
          trustRank: idx + 1,
        },
      }),
    ),
  );

  for (const fan of fans) {
    await prisma.starPayment.create({
      data: {
        userId: fan.id,
        starsAmount: 250,
        month: '2024-06',
        status: 'PAID',
      },
    });

    const seedTau = [100, 40, 30, 50, 30];
    const allocations = artistRows.map((artist, idx) => ({ artistId: artist.id, tauAmount: seedTau[idx] ?? 0 }));

    for (const allocation of allocations) {
      await prisma.trustAllocation.create({ data: { userId: fan.id, artistId: allocation.artistId, tauAmount: allocation.tauAmount } });
      await prisma.artist.update({ where: { id: allocation.artistId }, data: { trustScore: { increment: allocation.tauAmount } } });
    }
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
