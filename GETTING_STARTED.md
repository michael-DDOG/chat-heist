# Getting Started with Chat Heist

This guide will walk you through setting up Chat Heist from scratch.

## Step-by-Step Setup

### 1. Create Your Bot (5 minutes)

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name (e.g., "My Heist Bot")
4. Choose a username (e.g., "my_heist_bot")
5. **Save the bot token** that BotFather gives you

### 2. Create the Game (3 minutes)

1. Still in BotFather, send `/newgame`
2. Select your bot
3. Enter game details:
   - **Short name**: `CHAT_HEIST` (important: must match exactly)
   - **Title**: Chat Heist
   - **Description**: Fast, social heist runs for Telegram groups
   - **Photo**: Upload a 512x512 image (can be any heist-themed image)
   - **GIF/Animation**: Skip for now

### 3. Install Dependencies (2 minutes)

```bash
cd chat-heist
pnpm install
# or: npm install
```

### 4. Setup Environment (2 minutes)

```bash
cp .env.example .env
```

Edit `.env` and add your bot token:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=my_heist_bot
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Keep the rest as default for local development
```

### 5. Start Services (2 minutes)

Option A - Docker Compose (easiest):

```bash
docker compose up -d
```

Option B - Manual:
- Install PostgreSQL and Redis locally
- Update DATABASE_URL and REDIS_URL in .env

### 6. Initialize Database (1 minute)

```bash
pnpm db:dev
```

This creates tables and adds test data.

### 7. Start the Server (1 minute)

Open two terminal windows:

**Terminal 1** (Backend):
```bash
pnpm dev
```

**Terminal 2** (Tunnel):
```bash
pnpm tunnel
```

The tunnel will output a public URL like:
```
Public URL: https://abc123.loca.lt
```

**Copy this URL!**

### 8. Configure Webhook (2 minutes)

Update your `.env` with the tunnel URL:

```env
APP_BASE_URL=https://abc123.loca.lt
```

Restart the backend (Ctrl+C, then `pnpm dev` again).

Set the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://abc123.loca.lt/telegram/webhook"}'
```

Replace `<YOUR_BOT_TOKEN>` and the URL with your values.

Verify it worked:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

You should see your URL in the response.

### 9. Test the Game! (30 seconds)

1. Open Telegram
2. Find your bot
3. Send `/start`
4. Tap "🎮 Play Solo"
5. Select difficulty and start heisting!

---

## What You Just Built

✅ Full-stack Telegram game
✅ Server-side score validation
✅ Real-time leaderboards
✅ Shop system
✅ Anti-cheat protection
✅ Production-ready architecture

---

## Next Steps

### Test in a Group

1. Add your bot to a Telegram group
2. Send `/heist` in the group
3. Have friends join and play together!

### Customize the Game

Edit `src/core/constants.ts` to change:
- Energy refill rates
- Difficulty multipliers
- Gear costs
- Reward amounts

### Add Features

Ideas:
- More mini-game types in HeistScene.ts
- Sound effects & animations
- New gear types
- Achievements
- Seasonal events

### Deploy to Production

See README.md → Deployment section for:
- Render
- Railway
- Fly.io
- Custom VPS

---

## Troubleshooting

### "Bot not responding"

Check:
1. Webhook is set correctly (`/getWebhookInfo`)
2. Tunnel is still running
3. Backend server is running (`pnpm dev`)
4. Check terminal for errors

### "Game not loading"

Check:
1. Browser console (F12) for errors
2. `APP_BASE_URL` in .env matches your tunnel URL
3. CORS is enabled (should be by default)

### "Authentication failed"

Check:
1. TELEGRAM_BOT_TOKEN is correct in .env
2. initData verification is working (check logs)
3. Try deleting and re-setting webhook

### "Database errors"

Reset:
```bash
pnpm db:push --force-reset
pnpm db:dev
```

---

## Need Help?

- Check the full [README.md](README.md)
- Review the [Postman collection](postman/ChatHeist.postman_collection.json)
- Check server logs (`pnpm dev` output)
- Test APIs directly with Postman

---

**You're all set! Happy heisting! 🎭💰**
