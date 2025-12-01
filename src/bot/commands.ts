import TelegramBot from 'node-telegram-bot-api';
import { sendMessage, sendGame, getGameHighScores } from './telegram.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';

const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

/**
 * Handle /start command.
 */
export async function handleStart(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const isPrivate = msg.chat.type === 'private';

  if (isPrivate) {
    // DM flow: welcome + play button
    await sendMessage(
      chatId,
      `🎭 *Welcome to Chat Heist!*

Fast, social heist runs designed for group chats.

Tap actions, crack vaults, escape guards, and compete for the top spot.

Ready to start your criminal career?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎮 Play Solo', callback_data: 'play_solo' }],
            [
              {
                text: '👥 Add to Group',
                url: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?startgroup=heist`,
              },
            ],
          ],
        },
      }
    );
  } else {
    // Group chat: brief intro
    await sendMessage(
      chatId,
      `🎭 *Chat Heist is here!*

Use /heist to start a crew run, or /play for solo.`
    );
  }
}

/**
 * Handle /play command (solo game).
 */
export async function handlePlay(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;

  try {
    await sendGame(chatId, msg.message_thread_id);
  } catch (error) {
    logger.error({ error, chatId }, 'Failed to handle /play');
    await sendMessage(
      chatId,
      '❌ Failed to start game. Please try again.'
    );
  }
}

/**
 * Handle /heist command (group co-op).
 */
export async function handleHeist(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (!isGroup) {
    await sendMessage(
      chatId,
      '⚠️ /heist only works in group chats. Use /play for solo!'
    );
    return;
  }

  // Create lobby message
  const lobbyMsg = await sendMessage(
    chatId,
    `🎭 *HEIST STARTING*

Crew assembling... Tap JOIN to participate!

Players: 0/5
Time: 10s`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Join Heist', callback_data: 'join_heist' }],
          [{ text: '🚀 Start Now', callback_data: 'start_heist' }],
        ],
      },
    }
  );

  // Store lobby in Redis with 30s expiry
  const lobbyData = {
    chatId,
    messageId: lobbyMsg.message_id,
    hostId: msg.from?.id,
    players: [],
    createdAt: Date.now(),
  };

  // In production, use Redis to track active lobbies
  logger.info({ lobbyData }, 'Heist lobby created');
}

/**
 * Handle /top command (leaderboard).
 */
export async function handleTop(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  try {
    if (isGroup) {
      // Chat leaderboard
      const chat = await prisma.chat.findUnique({
        where: { tgChatId: BigInt(chatId) },
      });

      if (!chat) {
        await sendMessage(chatId, '📊 No scores yet for this chat!');
        return;
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const entries = await prisma.leaderboard.findMany({
        where: {
          scope: 'CHAT',
          chatId: chat.id,
          weekStartDate: weekStart,
        },
        orderBy: { bestScore: 'desc' },
        take: 10,
        include: { user: true },
      });

      if (entries.length === 0) {
        await sendMessage(chatId, '📊 No scores yet this week!');
        return;
      }

      let message = `🏆 *${msg.chat.title} - Top Thieves*\n\n`;
      entries.forEach((entry, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const name = entry.user.firstName || entry.user.username || 'Anonymous';
        message += `${medal} ${name}: ${entry.bestScore.toLocaleString()}\n`;
      });

      await sendMessage(chatId, message);
    } else {
      // Global leaderboard
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const entries = await prisma.leaderboard.findMany({
        where: {
          scope: 'GLOBAL',
          weekStartDate: weekStart,
        },
        orderBy: { bestScore: 'desc' },
        take: 10,
        include: { user: true },
      });

      let message = `🌍 *Global Top Thieves*\n\n`;
      entries.forEach((entry, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const name = entry.user.firstName || entry.user.username || 'Anonymous';
        message += `${medal} ${name}: ${entry.bestScore.toLocaleString()}\n`;
      });

      await sendMessage(chatId, message);
    }
  } catch (error) {
    logger.error({ error, chatId }, 'Failed to handle /top');
    await sendMessage(chatId, '❌ Failed to fetch leaderboard.');
  }
}

/**
 * Handle /link command (account info).
 */
export async function handleLink(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) {
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { tgUserId: BigInt(userId) },
    });

    if (!user) {
      await sendMessage(
        chatId,
        '⚠️ No account found. Play a game first!'
      );
      return;
    }

    const message = `👤 *Your Stats*

💰 Total Coins: ${user.coinsTotal.toLocaleString()}
⚡ Energy: ${user.energy}/${5}
🔥 Heat: ${user.heat}
🎯 Gear Level: ${user.gearLvl}

Keep heisting to climb the ranks!`;

    await sendMessage(chatId, message);
  } catch (error) {
    logger.error({ error, userId }, 'Failed to handle /link');
    await sendMessage(chatId, '❌ Failed to fetch account info.');
  }
}

/**
 * Register all bot commands.
 */
export async function registerCommands(bot: TelegramBot): Promise<void> {
  await bot.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'play', description: 'Play solo heist' },
    { command: 'heist', description: 'Start group heist (groups only)' },
    { command: 'top', description: 'View leaderboard' },
    { command: 'link', description: 'View your account' },
  ]);

  logger.info('Bot commands registered');
}
