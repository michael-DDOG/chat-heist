import 'dotenv/config';
import express from 'express';
import { logger } from './utils/logger.js';
import { handleWebhook, initBot } from './bot/index.js';
import { rateLimit, rateLimitPresets } from './api/middleware/rateLimit.js';

// Import API routers
import authRouter from './api/auth.js';
import gameRouter from './api/game.js';
import leaderboardRouter from './api/leaderboard.js';
import shopRouter from './api/shop.js';
import dailiesRouter from './api/dailies.js';
import meRouter from './api/me.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for game client
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'chat-heist' });
});

// Serve game client
app.use(express.static('web/dist'));

// Telegram webhook
app.post(
  '/telegram/webhook',
  rateLimit(rateLimitPresets.webhook),
  handleWebhook
);

// API routes
app.use('/auth', authRouter);
app.use('/game', gameRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/shop', shopRouter);
app.use('/dailies', dailiesRouter);
app.use('/me', meRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error({ err, path: req.path }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server
async function start() {
  try {
    // Initialize bot
    await initBot();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📱 Game URL: ${process.env.APP_BASE_URL || `http://localhost:${PORT}`}`);
      logger.info(`🎮 Webhook: ${process.env.APP_BASE_URL || `http://localhost:${PORT}`}/telegram/webhook`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
