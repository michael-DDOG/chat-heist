import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Verify Telegram initData HMAC signature.
 * Based on: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): { valid: boolean; data?: any } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return { valid: false };
    }

    // Remove hash from params
    params.delete('hash');

    // Sort params alphabetically
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate HMAC
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');

    // Compare hashes
    if (calculatedHash !== hash) {
      logger.warn('Invalid Telegram initData hash');
      return { valid: false };
    }

    // Parse user data
    const userData = params.get('user');
    if (!userData) {
      return { valid: false };
    }

    const user = JSON.parse(userData);

    // Parse auth date and check expiry (data valid for 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    const age = now - authDate;

    if (age > 86400) {
      logger.warn({ age }, 'Telegram initData expired');
      return { valid: false };
    }

    return {
      valid: true,
      data: {
        user,
        authDate,
        chatId: params.get('chat_instance'),
        startParam: params.get('start_param'),
      },
    };
  } catch (error) {
    logger.error({ error }, 'Error verifying Telegram initData');
    return { valid: false };
  }
}

/**
 * Parse initData query string into object.
 */
export function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}
