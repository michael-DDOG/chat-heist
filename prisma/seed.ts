import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { tgUserId: 123456789n },
    update: {},
    create: {
      tgUserId: 123456789n,
      username: 'test_player1',
      firstName: 'Alice',
      lastName: 'Heister',
      energy: 5,
      heat: 0,
      gearLvl: 1,
      coinsTotal: 1000,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { tgUserId: 987654321n },
    update: {},
    create: {
      tgUserId: 987654321n,
      username: 'test_player2',
      firstName: 'Bob',
      lastName: 'Robber',
      energy: 5,
      heat: 0,
      gearLvl: 1,
      coinsTotal: 500,
    },
  });

  // Create test chat
  const testChat = await prisma.chat.upsert({
    where: { tgChatId: -1001234567890n },
    update: {},
    create: {
      tgChatId: -1001234567890n,
      type: 'supergroup',
      title: 'Test Heist Crew',
    },
  });

  // Create some inventory for user1
  await prisma.inventory.upsert({
    where: {
      userId_gear: {
        userId: user1.id,
        gear: 'HACKER_RIG',
      },
    },
    update: {},
    create: {
      userId: user1.id,
      gear: 'HACKER_RIG',
      level: 2,
    },
  });

  await prisma.inventory.upsert({
    where: {
      userId_gear: {
        userId: user1.id,
        gear: 'DRILL',
      },
    },
    update: {},
    create: {
      userId: user1.id,
      gear: 'DRILL',
      level: 1,
    },
  });

  // Create sample runs
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const run1 = await prisma.run.create({
    data: {
      userId: user1.id,
      chatId: testChat.id,
      mode: 'COOP',
      score: 5000,
      cashEarned: 500,
      success: true,
      difficulty: 2,
      finishedAt: now,
      validated: true,
    },
  });

  const run2 = await prisma.run.create({
    data: {
      userId: user2.id,
      chatId: testChat.id,
      mode: 'SOLO',
      score: 3000,
      cashEarned: 300,
      success: true,
      difficulty: 1,
      finishedAt: now,
      validated: true,
    },
  });

  // Create leaderboard entries
  await prisma.leaderboard.create({
    data: {
      scope: 'GLOBAL',
      chatId: null,
      weekStartDate: weekStart,
      userId: user1.id,
      bestScore: 5000,
    },
  });

  await prisma.leaderboard.create({
    data: {
      scope: 'CHAT',
      chatId: testChat.id,
      weekStartDate: weekStart,
      userId: user1.id,
      bestScore: 5000,
    },
  });

  // Create daily tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyTask.upsert({
    where: {
      userId_date_taskType: {
        userId: user1.id,
        date: today,
        taskType: 'COMPLETE_3_RUNS',
      },
    },
    update: {},
    create: {
      userId: user1.id,
      date: today,
      taskType: 'COMPLETE_3_RUNS',
      progress: 1,
      target: 3,
    },
  });

  await prisma.dailyTask.upsert({
    where: {
      userId_date_taskType: {
        userId: user1.id,
        date: today,
        taskType: 'EARN_1000_COINS',
      },
    },
    update: {},
    create: {
      userId: user1.id,
      date: today,
      taskType: 'EARN_1000_COINS',
      progress: 500,
      target: 1000,
    },
  });

  console.log('✅ Seed completed!');
  console.log('Created users:', { user1: user1.username, user2: user2.username });
  console.log('Created chat:', testChat.title);
  console.log('Created runs:', { run1: run1.id, run2: run2.id });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
