import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { handleWebhook } from '../../src/bot/index';

describe('Telegram Webhook E2E', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/telegram/webhook', handleWebhook);
  });

  it('should handle /start command', async () => {
    const update = {
      update_id: 123456,
      message: {
        message_id: 1,
        from: {
          id: 123456789,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser',
        },
        chat: {
          id: 123456789,
          first_name: 'Test',
          username: 'testuser',
          type: 'private',
        },
        date: Math.floor(Date.now() / 1000),
        text: '/start',
      },
    };

    const response = await request(app)
      .post('/telegram/webhook')
      .send(update)
      .expect(200);
  });

  it('should handle callback query', async () => {
    const update = {
      update_id: 123457,
      callback_query: {
        id: 'query123',
        from: {
          id: 123456789,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser',
        },
        message: {
          message_id: 2,
          from: {
            id: 987654321,
            is_bot: true,
            first_name: 'Bot',
            username: 'testbot',
          },
          chat: {
            id: 123456789,
            first_name: 'Test',
            type: 'private',
          },
          date: Math.floor(Date.now() / 1000),
          text: 'Button test',
        },
        chat_instance: '123456',
        data: 'play_solo',
      },
    };

    const response = await request(app)
      .post('/telegram/webhook')
      .send(update)
      .expect(200);
  });

  it('should reject malformed update', async () => {
    const response = await request(app)
      .post('/telegram/webhook')
      .send({ invalid: 'data' })
      .expect(200); // Bot should always return 200 to Telegram
  });
});
