# Chat Heist - Quickstart Guide

Run and test locally in under 10 minutes.

---

## 0) Prerequisites

✅ **Node.js 18+** and **pnpm** installed
✅ **Docker Desktop** running (for Postgres + Redis)
✅ **Tunneling tool**: `cloudflared` or `ngrok`
✅ **Telegram account** (to create bot via @BotFather)

---

## 1) Install

```bash
cd chat-heist
pnpm install
```

---

## 2) Create Bot in @BotFather

Open [@BotFather](https://t.me/BotFather) in Telegram:

```
/newbot
```
- Choose a name: **Chat Heist**
- Choose username: **your_heist_bot** (must be unique)
- **Copy the BOT_TOKEN** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

```
/setinline
```
- Select your bot → **Enable**

```
/setjoingroups
```
- Select your bot → **Enable**

```
/newgame
```
- Select your bot
- **Short name**: `CHAT_HEIST` (must match exactly)
- **Title**: Chat Heist
- **Description**: Fast, social heist runs for Telegram groups
- **Photo**: Upload any 512x512 image (heist-themed)
- Skip GIF for now

**Optional but recommended:**
```
/setdescription
/setabouttext
```

---

## 3) Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=your_heist_bot
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat_heist?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# App
PORT=3000
APP_BASE_URL=                    # Fill after tunnel starts (step 7)
WEBHOOK_SECRET=random-secret-string
JWT_SECRET=another-random-secret-min-32-chars
NODE_ENV=development
```

---

## 4) Start Infrastructure

```bash
docker compose up -d
```

This starts Postgres + Redis. Verify they're running:

```bash
docker compose ps
```

You should see both services healthy.

---

## 5) Initialize Database

```bash
pnpm db:dev
```

This runs:
- `prisma db push` (creates tables)
- `prisma db seed` (adds test data)

You should see: ✅ Seed completed!

---

## 6) Start Backend

```bash
pnpm dev
```

You should see:
```
🚀 Server running on port 3000
📱 Game URL: http://localhost:3000
🎮 Webhook: http://localhost:3000/telegram/webhook
```

**Keep this terminal running!**

---

## 7) Expose via Tunnel

Open a **new terminal** and choose one:

### Option A: Cloudflared (recommended)

```bash
pnpm tunnel
```

Or manually:
```bash
cloudflared tunnel --url http://localhost:3000
```

### Option B: ngrok

```bash
ngrok http 3000
```

**Copy the HTTPS URL** (e.g., `https://abc-123.trycloudflare.com`)

Update `.env`:
```env
APP_BASE_URL=https://abc-123.trycloudflare.com
```

**Restart the backend** (Ctrl+C in first terminal, then `pnpm dev` again)

**Keep the tunnel terminal running!**

---

## 8) Set Telegram Webhook

Replace `<YOUR_BOT_TOKEN>` and `<YOUR_TUNNEL_URL>`:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"<YOUR_TUNNEL_URL>/telegram/webhook"}'
```

**Example:**
```bash
curl -X POST "https://api.telegram.org/bot123456789:ABCdef/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://abc-123.trycloudflare.com/telegram/webhook"}'
```

**Verify:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

You should see:
```json
{
  "ok": true,
  "result": {
    "url": "https://abc-123.trycloudflare.com/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

If you see `last_error_message`, check:
- Tunnel is running
- Backend is running
- URL is correct

---

## 9) Launch the Game! 🎮

### Option A: Direct Message

1. Open your bot in Telegram
2. Send `/start`
3. Tap **"🎮 Play Solo"**
4. Select difficulty
5. Start heisting!

### Option B: Deep Link

Open this URL in Telegram (replace `<YOUR_BOT_USERNAME>`):

```
https://t.me/<YOUR_BOT_USERNAME>?game=CHAT_HEIST
```

**Example:**
```
https://t.me/your_heist_bot?game=CHAT_HEIST
```

### Option C: Group Chat

1. Add your bot to a test group
2. Send `/heist` in the group
3. Have friends tap "Join"
4. Start the heist!

---

## 🎯 Testing Checklist

- [ ] Bot responds to `/start`
- [ ] Game loads in WebView
- [ ] Authentication works
- [ ] Can play a full heist (60s)
- [ ] Score submits successfully
- [ ] Coins are awarded
- [ ] Shop loads and shows gear
- [ ] Leaderboard works (`/top`)
- [ ] Profile loads (`/link`)

---

## 🐛 Troubleshooting

### Bot doesn't respond

**Check webhook:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

If `last_error_message` appears:
1. Verify tunnel is running
2. Verify backend is running
3. Check backend terminal for errors
4. Try deleting and re-setting webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
   # Then set it again
   ```

### Game doesn't load

1. Check browser console (F12) for errors
2. Verify `APP_BASE_URL` in `.env` matches tunnel
3. Check backend logs for authentication errors
4. Verify `TELEGRAM_BOT_TOKEN` is correct

### Database connection failed

```bash
# Check if Postgres is running
docker compose ps

# Restart services
docker compose down
docker compose up -d

# Re-initialize
pnpm db:dev
```

### Authentication failed

1. Check `TELEGRAM_BOT_TOKEN` in `.env`
2. Verify initData verification (check backend logs)
3. Try in incognito/private browser window

### Tunnel stopped working

Restart tunnel and update webhook with new URL:
```bash
# New tunnel URL
pnpm tunnel

# Update .env with new URL
# Restart backend
# Set webhook again
```

---

## 📊 View Database

While backend is running:

```bash
pnpm db:studio
```

Opens Prisma Studio at http://localhost:5555

---

## 🧪 Test APIs Directly

1. Import `postman/ChatHeist.postman_collection.json` into Postman
2. Update `base_url` variable to your tunnel URL
3. Test each endpoint

---

## 🎮 Test Game Features

### Solo Mode
1. `/start` → Play Solo
2. Complete heist
3. Check score in Results

### Group Mode
1. Add bot to group
2. `/heist` command
3. Multiple users join
4. Play together

### Shop
1. Earn coins from runs
2. Menu → Shop
3. Upgrade gear
4. Verify better performance

### Leaderboard
1. Complete multiple runs
2. `/top` command
3. See rankings
4. Check both chat and global

### Daily Tasks
1. Play from Menu
2. Complete runs
3. Check dailies in profile
4. Claim rewards

---

## 🚀 Next Steps

✅ Tested locally? → [Deploy to production](README.md#deployment)
✅ Want to customize? → Edit `src/core/constants.ts`
✅ Need help? → Check [README.md](README.md) or [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 💡 Pro Tips

- Use `pnpm db:studio` to inspect database
- Check backend logs for detailed errors
- Test in both DM and group chats
- Try different difficulties
- Test on mobile (where players will actually play)
- Monitor Redis with `redis-cli monitor`
- Use Postman collection for API debugging

---

**You're ready! Happy heisting! 🎭💰**
