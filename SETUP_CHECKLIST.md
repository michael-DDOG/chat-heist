# Setup Checklist - What You Need

Complete this checklist to get Chat Heist running with your Supabase project.

---

## ✅ Prerequisites Completed

- [x] Supabase project created
- [x] Project URL: `https://rgmtcjkgbtoxyqwdwpsk.supabase.co`

---

## 📋 What You Need to Provide

### 1. Supabase Database Password

**Where to find:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/database
2. Look for "Database Settings"
3. You should have set this when creating the project
4. If you forgot it, you can reset it on that page

**What it looks like:** A long random string (e.g., `k8dj3nfK92jdkLS...`)

---

### 2. Supabase Region

**Where to find:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/general
2. Look for "Region" under Project Settings
3. Common regions:
   - `us-east-1` (US East, Virginia)
   - `us-west-1` (US West, California)
   - `eu-west-1` (Europe, Ireland)
   - `ap-southeast-1` (Asia Pacific, Singapore)

**What it looks like:** Something like `us-east-1` or `eu-west-1`

---

### 3. Supabase Service Role Key

**Where to find:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/api
2. Scroll to "Service Role" section
3. Click "Reveal" next to `service_role` secret
4. Copy the long key

**What it looks like:** Starts with `eyJ...` (very long JWT token)

⚠️ **IMPORTANT**: This is a secret key! Never share it or commit it to Git.

---

### 4. Upstash Redis (Need to Create)

**Steps:**
1. Go to: https://console.upstash.com/
2. Sign up/login (free account)
3. Click "Create Database"
4. Settings:
   - **Name**: `chat-heist-redis`
   - **Type**: Regional
   - **Region**: Choose same as your Supabase region
   - **TLS**: Enabled (default)
5. Click "Create"
6. Copy the **UPSTASH_REDIS_REST_URL**

**What it looks like:** `rediss://default:AbCd1234...@endpoint.upstash.io:6379`

---

### 5. Telegram Bot Token

**Steps:**
1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow prompts to create your bot
4. Copy the bot token BotFather gives you

**What it looks like:** `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

---

### 6. Telegram Bot Username

**Where to get:**
- Same conversation with @BotFather
- When you create the bot, you choose a username
- Example: `my_heist_bot`

---

### 7. Random Security Keys

**Generate two 32-character hex strings:**

**On Linux/Mac:**
```bash
openssl rand -hex 32
```

**On Windows PowerShell:**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

Run this command **twice** to get:
- WEBHOOK_SECRET
- JWT_SECRET

---

## 🔧 Configuration Steps

### Step 1: Copy the Template

```bash
cd chat-heist
cp .env.supabase.example .env
```

### Step 2: Fill in Your Values

Edit `.env` with your actual values:

```env
# Telegram (from @BotFather)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_BOT_USERNAME=YOUR_BOT_USERNAME_HERE
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Supabase Database URL
# Replace [YOUR-DB-PASSWORD] and [REGION]
DATABASE_URL=postgresql://postgres.rgmtcjkgbtoxyqwdwpsk:[YOUR-DB-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Supabase API
SUPABASE_URL=https://rgmtcjkgbtoxyqwdwpsk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Upstash Redis
REDIS_URL=YOUR_UPSTASH_REDIS_URL_HERE

# Application
APP_BASE_URL=
NODE_ENV=development
PORT=3000

# Security (generated random strings)
WEBHOOK_SECRET=YOUR_32_CHAR_HEX_STRING_1
JWT_SECRET=YOUR_32_CHAR_HEX_STRING_2
```

### Step 3: Verify Your Configuration

**Example of a correctly filled `.env`:**

```env
# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=my_heist_bot
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST

# Supabase
DATABASE_URL=postgresql://postgres.rgmtcjkgbtoxyqwdwpsk:k8dj3nfK92jdkLS@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
SUPABASE_URL=https://rgmtcjkgbtoxyqwdwpsk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Upstash Redis
REDIS_URL=rediss://default:AbCd1234EfGh5678@endpoint.upstash.io:6379

# Application
APP_BASE_URL=
NODE_ENV=development
PORT=3000

# Security
WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

---

## ✅ Quick Verification Checklist

Before running the app, verify:

- [ ] DATABASE_URL contains your actual database password
- [ ] DATABASE_URL contains your actual region (e.g., `us-east-1`)
- [ ] DATABASE_URL ends with `?pgbouncer=true&sslmode=require`
- [ ] SUPABASE_URL is `https://rgmtcjkgbtoxyqwdwpsk.supabase.co`
- [ ] SUPABASE_SERVICE_ROLE_KEY is filled (starts with `eyJ...`)
- [ ] REDIS_URL starts with `rediss://` (double 's')
- [ ] TELEGRAM_BOT_TOKEN is from @BotFather
- [ ] WEBHOOK_SECRET is 32+ characters
- [ ] JWT_SECRET is 32+ characters (different from WEBHOOK_SECRET)

---

## 🚀 Next Steps

Once you've filled in all values:

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations to Supabase
pnpm db:migrate

# Seed test data (optional)
pnpm db:seed

# Start development server
pnpm dev
```

If everything is configured correctly, you should see:
```
✅ Redis connected
✅ Prisma Client initialized
🚀 Server running on port 3000
```

---

## 🐛 Common Issues

### "Can't reach database server"

**Problem**: DATABASE_URL is incorrect

**Fix**:
1. Verify password is correct
2. Verify region is correct (check Supabase dashboard)
3. Ensure URL ends with `?pgbouncer=true&sslmode=require`

### "Redis connection failed"

**Problem**: REDIS_URL is incorrect

**Fix**:
1. Verify URL starts with `rediss://` (double 's')
2. Check Upstash console for correct URL
3. Ensure database is active (not paused)

### "Invalid service role key"

**Problem**: SUPABASE_SERVICE_ROLE_KEY is wrong

**Fix**:
1. Go to Supabase Settings → API
2. Copy the `service_role` secret (not the `anon` key)
3. Make sure you copied the entire key

---

## 📞 Need Help?

**Supabase Dashboard:**
https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk

**Documentation:**
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed setup guide
- [QUICKSTART_SUPABASE.md](QUICKSTART_SUPABASE.md) - Quick start

---

**Once configured, you'll be ready to run Chat Heist! 🎭**
