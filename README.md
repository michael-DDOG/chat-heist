# 🎭 Chat Heist

Fast, social, replayable heist runs for Telegram groups. Tap actions, crack vaults, escape guards, and climb the leaderboards!

## Features

- **Fast Gameplay**: 60-90 second heist runs with quick tap mechanics
- **Social**: Co-op mode for group chats with 2-5 players
- **Progression**: Earn coins, upgrade gear, unlock abilities
- **Leaderboards**: Compete in your chat or globally
- **Risk/Reward**: Betray your crew for extra loot (but gain Heat!)
- **Daily Tasks**: Complete challenges for bonus rewards
- **Anti-Cheat**: Server-side validation with seeded RNG

## Tech Stack

- **Backend**: Node.js 20, TypeScript, Express, Prisma
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis (serverless)
- **Frontend**: Phaser 3 (HTML5 game engine)
- **Platform**: Telegram Games Platform (Mini Apps)
- **Deploy**: Render/Fly/Railway/Vercel (no Docker needed)

---

## Quick Start

**Want to get running FAST?** See **[QUICKSTART_SUPABASE.md](QUICKSTART_SUPABASE.md)** for a step-by-step guide (15 minutes).

**No Docker required!** Uses Supabase (cloud PostgreSQL) + Upstash (serverless Redis).

### Prerequisites

✅ Node.js 18+ and pnpm
✅ Supabase account (free)
✅ Upstash account (free)
✅ cloudflared or ngrok (tunneling)
✅ Telegram account (for @BotFather)

### 1. Setup Cloud Services

**Supabase (Database):**
1. Create project at [supabase.com](https://supabase.com)
2. Get pooled connection string (port 6543)
3. Add `?pgbouncer=true&sslmode=require`

**Upstash (Redis):**
1. Create database at [console.upstash.com](https://console.upstash.com)
2. Get Redis URL (starts with `rediss://`)

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

### 2. Install

```bash
cd chat-heist
pnpm install
```

### 3. Create Bot & Game

In [@BotFather](https://t.me/BotFather):
- `/newbot` → Get your **BOT_TOKEN**
- `/setinline` → Enable
- `/setjoingroups` → Enable
- `/newgame` → Short name: **CHAT_HEIST**

See [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) for detailed instructions.

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_BOT_USERNAME=your_bot
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379

APP_BASE_URL=                    # Fill after tunnel starts
```

### 5. Initialize Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional: test data
```

### 6. Run Development

**Terminal 1** (Backend):
```bash
pnpm dev
```

**Terminal 2** (Tunnel):
```bash
pnpm tunnel
```

Copy tunnel URL, update `APP_BASE_URL` in `.env`, restart backend.

### 7. Set Webhook

```bash
pnpm set:webhook
```

### 8. Play! 🎭

Open your bot in Telegram:
- Send `/start` → Tap "Play Solo"
- Or visit: `https://t.me/<YOUR_BOT>?game=CHAT_HEIST`

---

## Project Structure

```
chat-heist/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── bot/
│   │   ├── index.ts           # Webhook handler
│   │   ├── commands.ts        # Bot commands (/start, /play, /heist)
│   │   ├── telegram.ts        # Telegram API wrappers
│   │   └── verifyInitData.ts  # InitData HMAC verification
│   ├── api/
│   │   ├── auth.ts            # POST /auth/verifyInitData
│   │   ├── game.ts            # POST /game/start, /game/complete
│   │   ├── leaderboard.ts     # GET /leaderboard/global, /chat/:id
│   │   ├── shop.ts            # GET /shop/gear, POST /shop/buy
│   │   ├── dailies.ts         # GET /dailies, POST /dailies/claim
│   │   ├── me.ts              # GET /me (profile)
│   │   └── middleware/
│   │       ├── auth.ts        # JWT session auth
│   │       └── rateLimit.ts   # Redis rate limiting
│   ├── core/
│   │   ├── constants.ts       # Game config
│   │   ├── scoring.ts         # Score calculation & validation
│   │   ├── rng.ts             # Seeded RNG
│   │   └── antiCheat.ts       # Anti-cheat checks
│   ├── db/
│   │   └── client.ts          # Prisma client
│   └── utils/
│       ├── logger.ts          # Pino logger
│       └── redis.ts           # Redis client
├── web/                       # Phaser 3 game client
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.ts            # Phaser game init
│       ├── game/
│       │   ├── BootScene.ts   # Auth & init
│       │   ├── MenuScene.ts   # Main menu
│       │   ├── LobbyScene.ts  # Difficulty select
│       │   ├── HeistScene.ts  # Main gameplay (tap mini-events)
│       │   ├── EscapeScene.ts # Escape bonus round
│       │   ├── ResultsScene.ts# Score submission & results
│       │   └── ShopScene.ts   # Gear shop
│       ├── net/
│       │   └── api.ts         # Backend API client
│       └── state/
│           └── store.ts       # Global game state
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Test data
├── tests/
│   ├── unit/
│   │   ├── verifyInitData.spec.ts
│   │   └── scoring.spec.ts
│   └── e2e/
│       └── webhook.e2e.spec.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Game Flow

### Solo Mode

1. **Menu** → User sees coins, energy, heat
2. **Lobby** → Select difficulty (1-5)
3. **Heist** (60s) → Tap to complete mini-events (hack, drill, lockpick, etc.)
4. **Escape** (10s) → Dodge obstacles for bonus
5. **Results** → Score validated server-side, coins awarded

### Co-op Mode (Group Chats)

1. User sends `/heist` in group
2. Others tap "Join" button
3. Host starts → Everyone plays simultaneously
4. Team bonus applied to scores
5. Optional: Betray button steals team bonus but adds Heat

---

## API Endpoints

### Authentication

- **POST** `/auth/verifyInitData` - Verify Telegram initData, return session token

### Game

- **POST** `/game/start` - Start new run (requires auth)
- **POST** `/game/complete` - Submit run results, get rewards

### Leaderboard

- **GET** `/leaderboard/global?limit=50` - Global weekly leaderboard
- **GET** `/leaderboard/chat/:chatId?limit=50` - Chat weekly leaderboard

### Shop

- **GET** `/shop/gear` - List available gear & upgrades
- **POST** `/shop/buy` - Purchase/upgrade gear

### Dailies

- **GET** `/dailies` - Get today's tasks
- **POST** `/dailies/claim` - Claim completed task reward

### Profile

- **GET** `/me` - Current user stats, inventory, recent runs

---

## Bot Commands

- `/start` - Welcome message, Play button
- `/play` - Start solo heist
- `/heist` - Start group co-op heist (groups only)
- `/top` - View leaderboard
- `/link` - View account stats

---

## Testing

### Unit Tests

```bash
pnpm test
```

Tests initData verification and scoring logic.

### E2E Tests

```bash
pnpm test:e2e
```

Tests webhook handlers.

---

## Deployment

### Docker

```bash
docker build -t chat-heist .
docker run -p 3000:3000 --env-file .env chat-heist
```

### Render / Railway / Fly.io

1. Connect GitHub repo
2. Set environment variables from `.env`
3. Deploy
4. Update `APP_BASE_URL` in env to your production URL
5. Set webhook to `https://your-app.com/telegram/webhook`

### Database Migrations

On first deploy:

```bash
pnpm db:migrate
```

---

## Game Configuration

Edit `src/core/constants.ts`:

- Energy system (max 5, refills 1/15min)
- Run durations
- Difficulty multipliers
- Gear costs
- Heat penalties

---

## Anti-Cheat

- **Server-side validation**: All scores computed & verified server-side
- **Seeded RNG**: Events generated from seed, checked against client results
- **Nonce**: One-time tokens prevent replay attacks
- **Rate limits**: Redis-based rate limiting per user/IP
- **Pattern detection**: Flags suspicious behavior (identical scores, impossible timing)
- **Checksums**: Client sends checksum, server verifies

---

## Troubleshooting

### Webhook not working

```bash
# Check webhook status
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Delete webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/deleteWebhook

# Set webhook again
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-url.com/telegram/webhook"}'
```

### Game not loading

- Check browser console for errors
- Verify `APP_BASE_URL` matches your tunnel/server URL
- Ensure Telegram Web App script is loaded
- Check initData is being passed correctly

### Database errors

```bash
# Reset database
pnpm db:push --force-reset
pnpm db:dev
```

---

## Development Tips

- Use `pnpm db:studio` to view database in browser
- Check logs with `pnpm dev` for detailed error messages
- Use Postman collection (see `postman/`) to test API directly
- Test in both DM and group chats

---

## Roadmap

- [ ] Sound effects & music
- [ ] Animated sprites
- [ ] More mini-game types
- [ ] Achievements system
- [ ] Seasonal events
- [ ] NFT/Web3 integration (optional)

---

## Contributing

PRs welcome! Please:

1. Fork the repo
2. Create feature branch
3. Add tests for new features
4. Ensure `pnpm test` passes
5. Submit PR

---

## License

MIT - see [LICENSE](LICENSE)

---

## Credits

Built with:
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Phaser 3](https://phaser.io/)
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)

---

**Happy Heisting! 🎭💰**
