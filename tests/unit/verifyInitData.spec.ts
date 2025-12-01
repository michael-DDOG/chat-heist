import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyTelegramInitData } from '../../src/bot/verifyInitData';

describe('verifyTelegramInitData', () => {
  const BOT_TOKEN = 'test_bot_token_123';

  function createValidInitData(botToken: string, userData: any): string {
    const authDate = Math.floor(Date.now() / 1000);
    const userStr = JSON.stringify(userData);

    const params = new URLSearchParams({
      user: userStr,
      auth_date: authDate.toString(),
      chat_instance: '123456',
    });

    // Calculate HMAC
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    params.append('hash', hash);

    return params.toString();
  }

  it('should verify valid initData', () => {
    const userData = {
      id: 123456,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
    };

    const initData = createValidInitData(BOT_TOKEN, userData);
    const result = verifyTelegramInitData(initData, BOT_TOKEN);

    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.user.id).toBe(123456);
  });

  it('should reject initData with invalid hash', () => {
    const userData = { id: 123456, first_name: 'Test' };
    const initData = createValidInitData(BOT_TOKEN, userData);

    // Tamper with the data
    const tamperedData = initData.replace('Test', 'Hacker');

    const result = verifyTelegramInitData(tamperedData, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it('should reject initData without hash', () => {
    const initData = 'user={"id":123}&auth_date=1234567890';
    const result = verifyTelegramInitData(initData, BOT_TOKEN);

    expect(result.valid).toBe(false);
  });

  it('should reject expired initData', () => {
    const oldAuthDate = Math.floor(Date.now() / 1000) - 86400 - 100; // 24h + 100s ago
    const userData = { id: 123456, first_name: 'Test' };
    const userStr = JSON.stringify(userData);

    const params = new URLSearchParams({
      user: userStr,
      auth_date: oldAuthDate.toString(),
    });

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    params.append('hash', hash);

    const result = verifyTelegramInitData(params.toString(), BOT_TOKEN);
    expect(result.valid).toBe(false);
  });
});
