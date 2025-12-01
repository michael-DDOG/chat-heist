import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../utils/logger.js';

const botToken = process.env.TELEGRAM_BOT_TOKEN!;
const gameShortName = process.env.TELEGRAM_GAME_SHORT_NAME || 'CHAT_HEIST';

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN not set');
}

// Create bot instance (webhook mode, no polling)
export const bot = new TelegramBot(botToken, {
  polling: false,
});

/**
 * Send the game to a user or chat.
 */
export async function sendGame(
  chatId: number,
  messageThreadId?: number
): Promise<TelegramBot.Message> {
  try {
    return await bot.sendGame(chatId, gameShortName, {
      message_thread_id: messageThreadId,
    });
  } catch (error) {
    logger.error({ error, chatId }, 'Failed to send game');
    throw error;
  }
}

/**
 * Set a game score for a user.
 */
export async function setGameScore(
  userId: number,
  score: number,
  options: {
    chatId?: number;
    messageId?: number;
    inlineMessageId?: string;
    force?: boolean;
  } = {}
): Promise<boolean> {
  try {
    const result = await bot.setGameScore(userId, score, {
      chat_id: options.chatId,
      message_id: options.messageId,
      inline_message_id: options.inlineMessageId,
      force: options.force,
    });

    return result === true || (result as any).ok === true;
  } catch (error) {
    logger.error({ error, userId, score }, 'Failed to set game score');
    return false;
  }
}

/**
 * Get high scores for a game.
 */
export async function getGameHighScores(
  userId: number,
  options: {
    chatId?: number;
    messageId?: number;
    inlineMessageId?: string;
  } = {}
): Promise<TelegramBot.GameHighScore[]> {
  try {
    return await bot.getGameHighScores(userId, {
      chat_id: options.chatId,
      message_id: options.messageId,
      inline_message_id: options.inlineMessageId,
    });
  } catch (error) {
    logger.error({ error, userId }, 'Failed to get high scores');
    return [];
  }
}

/**
 * Send a text message.
 */
export async function sendMessage(
  chatId: number,
  text: string,
  options: TelegramBot.SendMessageOptions = {}
): Promise<TelegramBot.Message> {
  try {
    return await bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...options,
    });
  } catch (error) {
    logger.error({ error, chatId }, 'Failed to send message');
    throw error;
  }
}

/**
 * Answer callback query.
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  options: {
    text?: string;
    showAlert?: boolean;
    url?: string;
  } = {}
): Promise<boolean> {
  try {
    return await bot.answerCallbackQuery(callbackQueryId, options);
  } catch (error) {
    logger.error({ error, callbackQueryId }, 'Failed to answer callback');
    return false;
  }
}

/**
 * Edit message text.
 */
export async function editMessageText(
  text: string,
  options: {
    chatId?: number;
    messageId?: number;
    inlineMessageId?: string;
    replyMarkup?: TelegramBot.InlineKeyboardMarkup;
  }
): Promise<void> {
  try {
    await bot.editMessageText(text, {
      chat_id: options.chatId,
      message_id: options.messageId,
      inline_message_id: options.inlineMessageId,
      reply_markup: options.replyMarkup,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to edit message');
  }
}

/**
 * Set webhook URL.
 */
export async function setWebhook(url: string): Promise<boolean> {
  try {
    const result = await bot.setWebHook(url, {
      allowed_updates: ['message', 'callback_query', 'inline_query'],
    });
    logger.info({ url }, 'Webhook set successfully');
    return result;
  } catch (error) {
    logger.error({ error, url }, 'Failed to set webhook');
    return false;
  }
}

/**
 * Delete webhook.
 */
export async function deleteWebhook(): Promise<boolean> {
  try {
    const result = await bot.deleteWebHook();
    logger.info('Webhook deleted');
    return result;
  } catch (error) {
    logger.error({ error }, 'Failed to delete webhook');
    return false;
  }
}

/**
 * Get webhook info.
 */
export async function getWebhookInfo(): Promise<TelegramBot.WebhookInfo> {
  return await bot.getWebHookInfo();
}
