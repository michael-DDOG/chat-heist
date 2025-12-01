# Quick Setup Guide - Your Supabase Project

Your Supabase project is already configured! Just complete these final steps.

---

## ✅ Already Configured

- ✅ Supabase Project: `rgmtcjkgbtoxyqwdwpsk`
- ✅ Project URL: `https://rgmtcjkgbtoxyqwdwpsk.supabase.co`
- ✅ Service Role Key: Configured in `.env.ready`

---

## 📋 What You Still Need (5 items)

### 1. Database Password & Region

**Get Password:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/database
2. Scroll to "Database password"
3. If you forgot it, click "Reset database password"

**Get Region:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/general
2. Look for "Region" (e.g., `us-east-1`, `eu-west-1`)

---

### 2. Upstash Redis (Create New)

**Steps:**
1. Go to: https://console.upstash.com/
2. Sign up (free tier)
3. Click "Create Database"
4. Settings:
   - Name: `chat-heist-redis`
   - Type: Regional
   - Region: **Same as your Supabase region**
   - TLS: Enabled
5. Click "Create"
6. Copy the URL (starts with `rediss://`)

**Time:** 2 minutes

---

### 3. Telegram Bot (Create New)

**Steps:**
1. Open Telegram → Find [@BotFather](https://t.me/BotFather)
2. Send: `/newbot`
3. Choose name: `Chat Heist` (or whatever you want)
4. Choose username: `your_heist_bot` (must be unique)
5. **Copy the bot token** (looks like `123456:ABC...`)
6. Send: `/setinline` → Enable
7. Send: `/setjoingroups` → Enable
8. Send: `/newgame` → Select your bot → Set short name to `CHAT_HEIST`

**Time:** 3 minutes

---

### 4. Security Keys (Generate)

**Run this command TWICE** to generate two random keys:

**On Windows (PowerShell):**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**On Mac/Linux:**
```bash
openssl rand -hex 32
```

You'll get two strings like: `a1b2c3d4e5f6...` (64 characters each)

---

## 🔧 Setup Steps

### Step 1: Configure Environment

1. Open `.env.ready` file
2. Fill in the 5 TODO items:
   ```env
   DATABASE_URL=postgresql://postgres.rgmtcjkgbtoxyqwdwpsk:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
   REDIS_URL=rediss://default:...@....upstash.io:6379
   TELEGRAM_BOT_TOKEN=123456:ABC...
   TELEGRAM_BOT_USERNAME=your_heist_bot
   WEBHOOK_SECRET=a1b2c3d4e5f6...
   JWT_SECRET=z9y8x7w6v5u4...
   ```
3. Save as `.env` (remove `.ready` from filename)

---

### Step 2: Install & Migrate

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed test data (optional)
pnpm db:seed
```

**Expected output:**
```
✅ Migrations applied successfully
✅ Database ready
```

**Verify in Supabase:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/editor
2. You should see 8 tables: users, chats, runs, inventory, leaderboard, daily_tasks, sessions, rate_limits

---

### Step 3: Run Development Server

**Terminal 1:**
```bash
pnpm dev
```

**Expected output:**
```
✅ Redis connected
✅ Server running on port 3000
```

**Terminal 2:**
```bash
pnpm tunnel
```

**Copy the tunnel URL** (e.g., `https://abc-123.trycloudflare.com`)

---

### Step 4: Set Webhook

1. Update `.env`:
   ```env
   APP_BASE_URL=https://abc-123.trycloudflare.com
   ```

2. Restart server (Ctrl+C in Terminal 1, then `pnpm dev`)

3. Set webhook:
   ```bash
   pnpm set:webhook
   ```

**Expected output:**
```
✅ Webhook set successfully!
📊 Webhook Info:
   URL: https://abc-123.trycloudflare.com/telegram/webhook
   ✅ No errors
```

---

### Step 5: Test!

1. Open your bot in Telegram
2. Send `/start`
3. Tap "Play Solo"
4. Complete a heist!

**Verify data saved:**
- Supabase → Table Editor → Check `users`, `runs`, `leaderboard` tables

---

## ✅ Complete Example `.env`

Here's what your final `.env` should look like:

```env
# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=my_heist_bot
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Supabase
SUPABASE_URL=https://rgmtcjkgbtoxyqwdwpsk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnbXRjamtnYnRveHlxd2R3cHNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgyNTMzMCwiZXhwIjoyMDc4NDAxMzMwfQ.7Fxkd7PemRq_BTGxwfBMC5krAC5QNionaSO_xBB_KdU
DATABASE_URL=postgresql://postgres.rgmtcjkgbtoxyqwdwpsk:mySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Upstash Redis
REDIS_URL=rediss://default:AbCd1234EfGh5678@endpoint.upstash.io:6379

# Application
APP_BASE_URL=https://abc-123.trycloudflare.com
NODE_ENV=development
PORT=3000

# Security
WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3h2g1f0e9d8c7b6a5
```

---

## 🐛 Troubleshooting

### "Can't reach database server"

**Check:**
- DATABASE_URL has correct password
- DATABASE_URL has correct region
- Ends with `?pgbouncer=true&sslmode=require`

**Test connection:**
```bash
pnpm db:studio
```

### "Redis connection failed"

**Check:**
- REDIS_URL starts with `rediss://` (double 's')
- Upstash database is active
- Password is correct

### "Webhook error"

**Check:**
- Server is running (`pnpm dev`)
- Tunnel is running (`pnpm tunnel`)
- APP_BASE_URL matches tunnel URL
- Webhook was set (`pnpm set:webhook`)

---

## 🎯 Summary

**Total time:** ~10 minutes

**What you need:**
1. ✅ Database password & region (from Supabase)
2. ✅ Upstash Redis URL (create at upstash.com)
3. ✅ Telegram bot token (from @BotFather)
4. ✅ Two random security keys (generate with command)

**Then:**
```bash
pnpm install
pnpm db:migrate
pnpm dev
pnpm tunnel
pnpm set:webhook
# Play!
```

---

**Your Supabase project is ready - just add the final details! 🚀**
