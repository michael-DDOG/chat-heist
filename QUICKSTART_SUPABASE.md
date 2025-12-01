# Chat Heist - Quickstart (Supabase Edition)

Get running in 15 minutes with Supabase + Upstash. **No Docker required!**

---

## Prerequisites

✅ Node.js 18+ and pnpm
✅ Telegram account
✅ Supabase account (free)
✅ Upstash account (free)

---

## Step 1: Create Telegram Bot (3 min)

1. Open [@BotFather](https://t.me/BotFather)

2. Create bot:
   ```
   /newbot
   ```
   - Name: Chat Heist
   - Username: your_heist_bot

3. **Save the bot token!**

4. Enable features:
   ```
   /setinline → Enable
   /setjoingroups → Enable
   ```

5. Create game:
   ```
   /newgame
   ```
   - Select your bot
   - Short name: `CHAT_HEIST`
   - Title: Chat Heist
   - Description: Fast heist runs for groups
   - Photo: Upload any 512x512 image

---

## Step 2: Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com) → New Project

2. Settings:
   - Name: `chat-heist`
   - Password: **(save this!)**
   - Region: Choose closest

3. Wait 2 min for creation

4. Get connection string:
   - Settings → Database → Connection String → **Session mode**
   - Copy the string (port 6543)
   - Add: `?pgbouncer=true&sslmode=require`

5. Get API keys:
   - Settings → API
   - Copy **Project URL**
   - Copy **service_role** secret

---

## Step 3: Create Upstash Redis (2 min)

1. Go to [console.upstash.com](https://console.upstash.com)

2. Create Database:
   - Name: `chat-heist-redis`
   - Type: Regional
   - Region: Same as Supabase

3. Copy **UPSTASH_REDIS_REST_URL**
   - Format: `rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379`

---

## Step 4: Install & Configure (3 min)

```bash
cd chat-heist
pnpm install
```

Create `.env`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Supabase
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379

# App
APP_BASE_URL=
NODE_ENV=development
PORT=3000

# Security (generate with: openssl rand -hex 32)
WEBHOOK_SECRET=your_random_32_char_hex
JWT_SECRET=your_random_32_char_hex
```

---

## Step 5: Setup Database (1 min)

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional: adds test data
```

✅ Check Supabase dashboard → Table Editor to see tables

---

## Step 6: Run & Tunnel (2 min)

**Terminal 1** (Server):
```bash
pnpm dev
```

✅ Should see: `Redis connected`, `Server running`

**Terminal 2** (Tunnel):
```bash
pnpm tunnel
```

✅ Copy the HTTPS URL (e.g., `https://abc-123.trycloudflare.com`)

Update `.env`:
```env
APP_BASE_URL=https://abc-123.trycloudflare.com
```

Restart server (Ctrl+C, then `pnpm dev`)

---

## Step 7: Set Webhook (1 min)

```bash
pnpm set:webhook
```

✅ Should see:
```
✅ Webhook set successfully!
📊 Webhook Info:
   URL: https://abc-123.trycloudflare.com/telegram/webhook
   ✅ No errors
```

---

## Step 8: Play! 🎮

1. Open your bot in Telegram
2. Send `/start`
3. Tap "Play Solo"
4. Select difficulty
5. Complete heist!

✅ Score saves to Supabase
✅ Check leaderboard: `/top`
✅ Check profile: `/link`

---

## Verification Checklist

Check Supabase → Table Editor:

- [ ] **users** table has your Telegram user
- [ ] **runs** table has your completed run
- [ ] **sessions** table has auth session
- [ ] **leaderboard** table has your score

Check Upstash → Data Browser:

- [ ] Session keys present
- [ ] Rate limit keys present

---

## Troubleshooting

### "Can't reach database server"

- Check DATABASE_URL in `.env`
- Ensure `?pgbouncer=true&sslmode=require` at end
- Verify Supabase project is active (not paused)

### "Redis connection failed"

- Verify REDIS_URL starts with `rediss://` (double 's')
- Check Upstash database is active
- Verify password is correct

### "Webhook error"

- Ensure server is running
- Check tunnel is active
- Verify URL is HTTPS
- Test: `curl https://your-url.com/health`

### "Authentication failed"

- Check TELEGRAM_BOT_TOKEN is correct
- Verify bot username matches
- Try clearing browser cache

---

## Next Steps

### Deploy to Production

**Render (easiest):**
1. Sign up at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Add environment variables
5. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for full guide.

### Customize Game

Edit `src/core/constants.ts`:
- Energy refill rate
- Difficulty multipliers
- Gear costs
- Rewards

### Add Features

Ideas:
- More mini-game types
- Sound effects
- Animations
- New gear items
- Achievements

---

## Costs

### Free Tier (Good for 1,000 users)

- Supabase: 500MB database
- Upstash: 10,000 commands/day
- Render: 750 hours/month
- **Total: $0/month**

### Paid (10,000+ users)

- Supabase Pro: $25/month
- Upstash Pro: $10/month
- Render Starter: $7/month
- **Total: ~$42/month**

---

## Resources

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed Supabase guide
- [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) - Complete bot setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [README.md](README.md) - Full documentation

---

**You're ready! No Docker, no local databases - just cloud-native fun! 🎭☁️**
