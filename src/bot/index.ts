import { Request, Response } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { bot, sendGame, answerCallbackQuery } from './telegram.js';
import {
  handleStart,
  handlePlay,
  handleHeist,
  handleTop,
  handleLink,
} from './commands.js';
import { logger } from '../utils/logger.js';

const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
const gameShortName = process.env.TELEGRAM_GAME_SHORT_NAME || 'CHAT_HEIST';

/**
 * Main webhook handler for Telegram updates.
 */
export async function handleWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const update: TelegramBot.Update = req.body;

    // Process update
    await processUpdate(update);

    res.sendStatus(200);
  } catch (error) {
    logger.error({ error }, 'Webhook handler error');
    res.sendStatus(500);
  }
}

/**
 * Process a Telegram update.
 */
async function processUpdate(update: TelegramBot.Update): Promise<void> {
  // Handle messages
  if (update.message) {
    const msg = update.message;

    // Commands
    if (msg.text?.startsWith('/')) {
      const command = msg.text.split(' ')[0].toLowerCase();

      switch (command) {
        case '/start':
          await handleStart(msg);
          break;
        case '/play':
          await handlePlay(msg);
          break;
        case '/heist':
          await handleHeist(msg);
          break;
        case '/top':
          await handleTop(msg);
          break;
        case '/link':
          await handleLink(msg);
          break;
        default:
          logger.debug({ command }, 'Unknown command');
      }
    }
  }

  // Handle callback queries (inline buttons)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }

  // Handle inline queries (for sharing game in chats)
  if (update.inline_query) {
    await handleInlineQuery(update.inline_query);
  }
}

/**
 * Handle callback query from inline buttons.
 */
async function handleCallbackQuery(
  query: TelegramBot.CallbackQuery
): Promise<void> {
  const data = query.data;
  const chatId = query.message?.chat.id;
  const userId = query.from.id;

  if (!data) return;

  try {
    switch (data) {
      case 'play_solo':
        // Send game to user
        if (chatId) {
          await sendGame(chatId);
        }
        await answerCallbackQuery(query.id, { text: 'Starting game...' });
        break;

      case 'join_heist':
        // Join heist lobby (would track in Redis)
        await answerCallbackQuery(query.id, {
          text: 'Joined the crew!',
        });
        // Update lobby message with new player count
        break;

      case 'start_heist':
        // Start heist immediately
        if (chatId) {
          await sendGame(chatId, query.message?.message_thread_id);
        }
        await answerCallbackQuery(query.id, {
          text: 'Heist starting!',
        });
        break;

      default:
        await answerCallbackQuery(query.id);
    }
  } catch (error) {
    logger.error({ error, data }, 'Callback query error');
    await answerCallbackQuery(query.id, {
      text: 'Error occurred',
      showAlert: true,
    });
  }
}

/**
 * Handle inline query for sharing game.
 */
async function handleInlineQuery(
  query: TelegramBot.InlineQuery
): Promise<void> {
  try {
    const results: TelegramBot.InlineQueryResult[] = [
      {
        type: 'game',
        id: '1',
        game_short_name: gameShortName,
      },
    ];

    await bot.answerInlineQuery(query.id, results, {
      cache_time: 300,
    });
  } catch (error) {
    logger.error({ error }, 'Inline query error');
  }
}

/**
 * Initialize bot (set commands, etc.)
 */
export async function initBot(): Promise<void> {
  logger.info('Initializing bot...');

  // Import and register commands
  const { registerCommands } = await import('./commands.js');
  await registerCommands(bot);

  logger.info('Bot initialized');
}
