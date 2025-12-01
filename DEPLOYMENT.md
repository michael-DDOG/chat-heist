# Deployment Guide

Deploy Chat Heist to production on various platforms.

---

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Rate limits configured
- [ ] Anti-cheat enabled
- [ ] Error logging configured
- [ ] Webhook URL prepared
- [ ] Domain/subdomain ready (optional)

---

## Option 1: Render.com (Easiest)

### 1. Create PostgreSQL Database

1. Go to [render.com](https://render.com)
2. New → PostgreSQL
3. Name: `chat-heist-db`
4. Plan: Free (or Starter for production)
5. Copy **Internal Database URL**

### 2. Create Redis Instance

1. New → Redis
2. Name: `chat-heist-redis`
3. Plan: Free (or Starter)
4. Copy **Internal Redis URL**

### 3. Create Web Service

1. New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Name**: `chat-heist`
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Free (or Starter)

### 4. Environment Variables

Add in Render dashboard:

```env
TELEGRAM_BOT_TOKEN=<your_token>
TELEGRAM_BOT_USERNAME=<your_bot_username>
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

DATABASE_URL=<internal_postgres_url>
REDIS_URL=<internal_redis_url>

APP_BASE_URL=https://chat-heist.onrender.com
WEBHOOK_SECRET=<generate_random_32_chars>
JWT_SECRET=<generate_random_32_chars>

NODE_ENV=production
PORT=3000
```

### 5. Deploy

1. Click "Create Web Service"
2. Wait for build (~5 minutes)
3. Note your URL: `https://chat-heist.onrender.com`

### 6. Initialize Database

Use Render Shell:
```bash
pnpm db:migrate
```

### 7. Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://chat-heist.onrender.com/telegram/webhook"}'
```

---

## Option 2: Railway.app

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
railway login
```

### 2. Initialize Project

```bash
cd chat-heist
railway init
```

### 3. Add PostgreSQL & Redis

```bash
railway add --database postgresql
railway add --database redis
```

### 4. Set Environment Variables

```bash
railway variables set TELEGRAM_BOT_TOKEN=<token>
railway variables set TELEGRAM_BOT_USERNAME=<username>
railway variables set TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST
railway variables set APP_BASE_URL=https://chat-heist.railway.app
railway variables set WEBHOOK_SECRET=<random>
railway variables set JWT_SECRET=<random>
railway variables set NODE_ENV=production
```

Railway auto-sets DATABASE_URL and REDIS_URL.

### 5. Deploy

```bash
railway up
```

### 6. Get URL

```bash
railway domain
```

### 7. Run Migrations

```bash
railway run pnpm db:migrate
```

---

## Option 3: Fly.io

### 1. Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Login

```bash
fly auth login
```

### 3. Create App

```bash
cd chat-heist
fly launch
```

Answer prompts:
- **App name**: chat-heist
- **Region**: Choose closest
- **PostgreSQL**: Yes
- **Redis**: Yes

### 4. Set Secrets

```bash
fly secrets set TELEGRAM_BOT_TOKEN=<token>
fly secrets set TELEGRAM_BOT_USERNAME=<username>
fly secrets set TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST
fly secrets set WEBHOOK_SECRET=<random>
fly secrets set JWT_SECRET=<random>
```

### 5. Deploy

```bash
fly deploy
```

### 6. Run Migrations

```bash
fly ssh console
pnpm db:migrate
exit
```

---

## Option 4: DigitalOcean App Platform

### 1. Create App

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Create → Apps
3. Connect GitHub repo

### 2. Configure Build

- **Build Command**: `pnpm install && pnpm build`
- **Run Command**: `pnpm start`
- **HTTP Port**: 3000

### 3. Add Database Components

Add in Resources tab:
- PostgreSQL Dev Database
- Redis Dev Database

### 4. Environment Variables

Set in Settings:

```env
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_BOT_USERNAME=<username>
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST
APP_BASE_URL=${APP_URL}
WEBHOOK_SECRET=<random>
JWT_SECRET=<random>
NODE_ENV=production
```

DATABASE_URL and REDIS_URL are auto-injected.

### 5. Deploy

Click "Deploy" and wait for build.

---

## Option 5: Custom VPS (Ubuntu)

### 1. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker (for Postgres/Redis)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Clone & Install

```bash
git clone <your-repo> /var/www/chat-heist
cd /var/www/chat-heist
pnpm install
```

### 3. Setup Environment

```bash
cp .env.example .env
nano .env
```

Fill in production values.

### 4. Start Services

```bash
docker compose up -d
pnpm db:migrate
```

### 5. Setup PM2 (Process Manager)

```bash
npm install -g pm2

# Start app
pm2 start pnpm --name chat-heist -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

### 6. Setup Nginx Reverse Proxy

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/chat-heist
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/chat-heist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check health
curl https://your-app.com/health

# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Set Production Webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-app.com/telegram/webhook"}'
```

### 3. Verify Webhook

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Should show your production URL with no errors.

### 4. Test the Game

1. Open bot in Telegram
2. Send `/start`
3. Play a full game
4. Verify score saves
5. Check leaderboard
6. Test shop purchase

---

## Monitoring & Maintenance

### Logs

**Render:**
```bash
# View logs in dashboard or:
render logs
```

**Railway:**
```bash
railway logs
```

**Fly:**
```bash
fly logs
```

**PM2 (VPS):**
```bash
pm2 logs chat-heist
```

### Database Backups

**Render:**
- Automatic daily backups on paid plans
- Manual: Export in dashboard

**Railway:**
- Enable backups in database settings

**Fly:**
```bash
fly postgres backup list
```

**Manual (VPS):**
```bash
# Backup
docker exec postgres pg_dump -U postgres chat_heist > backup.sql

# Restore
docker exec -i postgres psql -U postgres chat_heist < backup.sql
```

### Health Checks

Add to monitoring tool (e.g., UptimeRobot):
- **Endpoint**: `https://your-app.com/health`
- **Interval**: 5 minutes
- **Alert**: Email/SMS on failure

### Error Tracking

**Add Sentry (recommended):**

1. Install:
```bash
pnpm add @sentry/node
```

2. Initialize in `src/server.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

3. Add DSN to env vars

---

## Scaling Considerations

### Horizontal Scaling

If traffic grows:

1. **Load Balancer**: Use platform's built-in LB
2. **Session Store**: Redis already centralized ✅
3. **Database**: Use read replicas for queries
4. **Rate Limits**: Redis handles distributed limiting ✅

### Vertical Scaling

**Render/Railway:**
- Upgrade plan in dashboard

**Fly:**
```bash
fly scale vm shared-cpu-2x
```

**VPS:**
- Upgrade server size

### CDN for Game Assets

1. Deploy `web/dist` to CDN (Cloudflare, Vercel)
2. Update references in HTML
3. Reduce server load

---

## Environment Variables Reference

Required:
```env
TELEGRAM_BOT_TOKEN=<from_botfather>
TELEGRAM_BOT_USERNAME=<bot_username>
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST
DATABASE_URL=<postgres_connection_string>
REDIS_URL=<redis_connection_string>
APP_BASE_URL=<https_production_url>
WEBHOOK_SECRET=<random_32_chars>
JWT_SECRET=<random_32_chars>
NODE_ENV=production
PORT=3000
```

Optional:
```env
LOG_LEVEL=info
SENTRY_DSN=<sentry_project_dsn>
```

---

## Rollback Procedure

**Render/Railway:**
1. Go to deployments
2. Select previous version
3. Click "Redeploy"

**Fly:**
```bash
fly releases
fly releases rollback <version>
```

**VPS:**
```bash
cd /var/www/chat-heist
git log
git checkout <previous_commit>
pm2 restart chat-heist
```

---

## Troubleshooting

### Deployment fails

Check:
- Build logs for errors
- Environment variables set correctly
- Database connection string valid
- Redis connection string valid

### Webhook not receiving updates

1. Verify URL is HTTPS
2. Check webhook info:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```
3. Check server logs for incoming requests
4. Verify route `/telegram/webhook` exists

### Database connection issues

1. Verify DATABASE_URL format
2. Check database is running
3. Verify network access (VPS: firewall rules)
4. Test connection:
   ```bash
   pnpm prisma db pull
   ```

### High memory usage

1. Check for memory leaks (Redis key expiry)
2. Limit Prisma connection pool
3. Upgrade server tier
4. Add horizontal scaling

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment secrets not in code
- [ ] Rate limiting active
- [ ] CORS configured correctly
- [ ] Database backups enabled
- [ ] Error logs don't expose secrets
- [ ] Webhook signature verified
- [ ] Anti-cheat active
- [ ] User input sanitized

---

**Deployment complete! Monitor logs and enjoy your live game! 🎭🚀**
