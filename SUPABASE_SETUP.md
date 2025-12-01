# Supabase + Upstash Setup Guide

Complete guide to setting up Chat Heist with Supabase (PostgreSQL) and Upstash (Redis).

**No Docker required!**

---

## Part 1: Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in / Create account
3. Click "New Project"
4. Fill in:
   - **Name**: chat-heist
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for development

5. Wait 2-3 minutes for project creation

### 2. Get Database Connection String

1. In your project dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Select **Session mode** (for Prisma)
4. Copy the connection string (port 6543)
5. It looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

6. **Important**: Add these parameters to the end:
   ```
   ?pgbouncer=true&sslmode=require
   ```

Final URL:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### 3. Get Service Role Key

1. Go to **Settings** → **API**
2. Find **Service Role** section
3. Copy the **service_role secret** key
4. ⚠️ **Keep this secret!** Only use on backend, never expose to frontend

### 4. Get Project URL

In the same API settings page:
- Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)

---

## Part 2: Upstash Redis Setup

### 1. Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign in with GitHub/Google
3. Free tier: 10,000 commands/day

### 2. Create Redis Database

1. Click "Create Database"
2. Settings:
   - **Name**: chat-heist-redis
   - **Type**: Regional
   - **Region**: Choose same as Supabase
   - **TLS**: Enabled (default)

3. Click "Create"

### 3. Get Redis URL

1. Click on your database
2. Scroll to **REST API** section
3. Copy the **UPSTASH_REDIS_REST_URL**

   Format:
   ```
   rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
   ```

---

## Part 3: Environment Configuration

Create `.env` file:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Supabase
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379

# Application
APP_BASE_URL=
NODE_ENV=development
PORT=3000

# Security
WEBHOOK_SECRET=generate_random_32_chars
JWT_SECRET=generate_random_32_chars
```

**Generate secrets:**
```bash
# On macOS/Linux:
openssl rand -hex 32

# On Windows (PowerShell):
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

---

## Part 4: Database Migration

### 1. Install Dependencies

```bash
cd chat-heist
pnpm install
```

### 2. Generate Prisma Client

```bash
pnpm db:generate
```

### 3. Run Migrations

```bash
pnpm db:migrate
```

This will:
- Enable required PostgreSQL extensions (uuid-ossp, pgcrypto, citext)
- Create all tables with UUID primary keys
- Set up indexes
- Configure foreign keys
- Disable Row Level Security (RLS) on bot tables

### 4. Verify Migration

```bash
pnpm db:studio
```

Opens Prisma Studio at `http://localhost:5555`

You should see:
- users
- chats
- runs
- inventory
- leaderboard
- daily_tasks
- sessions
- rate_limits

### 5. Seed Database (Optional)

```bash
pnpm db:seed
```

Creates test data:
- 2 test users
- 1 test chat
- Sample runs
- Sample inventory
- Leaderboard entries

---

## Part 5: Local Development

### 1. Start Server

```bash
pnpm dev
```

Should see:
```
🚀 Server running on port 3000
Prisma Client initialized
Redis connected
```

### 2. Start Tunnel

In new terminal:
```bash
pnpm tunnel
```

Copy the public URL (e.g., `https://abc-123.trycloudflare.com`)

### 3. Update Environment

Add tunnel URL to `.env`:
```env
APP_BASE_URL=https://abc-123.trycloudflare.com
```

Restart server.

### 4. Set Webhook

```bash
pnpm set:webhook --url=https://abc-123.trycloudflare.com
```

Or if `APP_BASE_URL` is set:
```bash
pnpm set:webhook
```

Verify output shows:
```
✅ Webhook set successfully!
📊 Webhook Info:
   URL: https://abc-123.trycloudflare.com/telegram/webhook
   Pending updates: 0
   ✅ No errors
```

---

## Part 6: Testing

### 1. Test Bot

1. Open your bot in Telegram
2. Send `/start`
3. ✅ Should respond with game button

### 2. Test Game

1. Tap "Play Solo"
2. ✅ Game loads in WebView
3. Select difficulty
4. Play heist
5. ✅ Score saves to Supabase

### 3. Verify Database

Check Supabase dashboard → Table Editor:
- **users**: Should have your Telegram user
- **runs**: Should have completed run
- **sessions**: Should have auth session
- **leaderboard**: Should have your score

### 4. Verify Redis

Check Upstash dashboard → Data Browser:
- Look for session keys
- Rate limit keys
- Nonce keys

---

## Part 7: Production Deployment

### Option 1: Render

1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build**: `pnpm install && pnpm build`
   - **Start**: `pnpm start`
   - **Environment**: Add all vars from `.env`

5. Deploy
6. Copy deployed URL
7. Update `APP_BASE_URL` in Render env vars
8. Set webhook:
   ```bash
   pnpm set:webhook --url=https://your-app.onrender.com
   ```

### Option 2: Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

Add environment variables in Railway dashboard.

### Option 3: Fly.io

```bash
fly launch
fly secrets set TELEGRAM_BOT_TOKEN=... DATABASE_URL=... REDIS_URL=...
fly deploy
```

---

## Troubleshooting

### Database Connection Fails

**Error**: `Can't reach database server`

**Fix**:
1. Verify DATABASE_URL is correct
2. Check password has no special characters that need escaping
3. Ensure `?pgbouncer=true&sslmode=require` is at the end
4. Check Supabase project is not paused (free tier pauses after 1 week inactivity)

### Redis Connection Fails

**Error**: `Connection refused` or `ENOTFOUND`

**Fix**:
1. Verify REDIS_URL format: `rediss://` (with double 's')
2. Check Upstash database is active
3. Verify password is correct
4. Try regenerating Redis password in Upstash dashboard

### Migrations Fail

**Error**: `Extension "uuid-ossp" not found`

**Fix**:
Supabase enables extensions automatically. If not:
1. Go to Supabase dashboard → Database → Extensions
2. Enable: uuid-ossp, pgcrypto, citext

### Webhook Not Working

**Error**: `last_error_message` in webhook info

**Fix**:
1. Ensure server is running
2. Check tunnel is active
3. Verify URL is HTTPS
4. Check server logs for errors
5. Test endpoint manually:
   ```bash
   curl https://your-url.com/health
   ```

---

## Cost Estimate

### Free Tier
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Upstash**: 10,000 commands/day
- **Render**: 750 hours/month free

**Total**: $0/month for ~1,000 users

### Paid (Scaling)
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)
- **Upstash**: $10/month (1M commands/day)
- **Render Starter**: $7/month (persistent server)

**Total**: ~$42/month for 10,000+ users

---

## Monitoring

### Supabase
1. Dashboard → Reports
2. Check:
   - Database size
   - API requests
   - Bandwidth usage

### Upstash
1. Dashboard → Metrics
2. Check:
   - Commands per second
   - Memory usage
   - Hit rate

### Application
1. Server logs: `pnpm dev` output
2. Webhook status:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` not exposed to frontend
- [ ] Database URL uses SSL (`sslmode=require`)
- [ ] Redis URL uses TLS (`rediss://`)
- [ ] Webhook secret is random and secure
- [ ] JWT secret is random and secure
- [ ] No secrets committed to Git
- [ ] Row Level Security (RLS) disabled on bot tables
- [ ] Environment variables set in production

---

## Backup & Recovery

### Supabase Backups
- **Free tier**: Daily backups (7 days retention)
- **Pro**: Point-in-time recovery (up to 30 days)

### Manual Backup
```bash
# Export from Supabase
pg_dump "postgresql://postgres:..." > backup.sql

# Import later
psql "postgresql://postgres:..." < backup.sql
```

### Upstash
- Snapshots available on paid plans
- Export/import via CLI

---

## Next Steps

✅ Supabase + Upstash configured
✅ Migrations applied
✅ Local dev working
✅ Webhook set

**Now**:
1. Test all game features
2. Deploy to production
3. Monitor usage
4. Scale as needed

---

**No Docker, no local databases - just deploy and play! 🎭**
