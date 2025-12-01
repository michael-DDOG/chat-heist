# Final Setup Steps - You're Almost Done! 🎉

I've configured everything I can with the information you provided. Just 3 quick steps left!

---

## ✅ Already Configured

- ✅ Telegram Bot Token: `8568768014:AAEv9IybFHBZskxZoBUaHl6Cn2MtNmAVLUo`
- ✅ Telegram Bot Username: `chatheist_bot`
- ✅ Supabase Project: `rgmtcjkgbtoxyqwdwpsk`
- ✅ Database Password: `Starter01@!123`
- ✅ Service Role Key: Configured

---

## 📋 3 Things You Still Need

### 1. Your Supabase Region (30 seconds)

**Find it:**
1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/general
2. Look for "Region" (e.g., `us-east-1`, `eu-west-1`, `ap-southeast-1`)
3. Note it down

**Common regions:**
- `us-east-1` - US East (Virginia)
- `us-west-1` - US West (California)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

---

### 2. Create Upstash Redis (2 minutes)

**Steps:**
1. Go to: https://console.upstash.com/
2. Sign up with GitHub/Google (free)
3. Click **"Create Database"**
4. Settings:
   - **Name**: `chat-heist-redis`
   - **Type**: Regional
   - **Region**: **Choose the SAME region as your Supabase** (from step 1)
   - **TLS**: Enabled (default)
5. Click **"Create"**
6. Copy the **Redis URL** (format: `rediss://default:ABC123@endpoint.upstash.io:6379`)

---

### 3. Generate Security Keys (30 seconds)

**Run this command TWICE** (in PowerShell or Terminal):

**Windows (PowerShell):**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**Mac/Linux (Terminal):**
```bash
openssl rand -hex 32
```

You'll get two strings like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

First run = `WEBHOOK_SECRET`
Second run = `JWT_SECRET`

---

## 🔧 Complete Setup

### Step 1: Edit `.env.complete`

1. Open the file `.env.complete` in this folder
2. **Replace `[REGION]`** in the DATABASE_URL with your region from step 1
3. **Paste your Upstash Redis URL** from step 2
4. **Paste the two security keys** from step 3

**Example of what it should look like:**

```env
# If your region is us-east-1:
DATABASE_URL=postgresql://postgres.rgmtcjkgbtoxyqwdwpsk:Starter01@!123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Your Upstash URL:
REDIS_URL=rediss://default:AbCd1234EfGh@endpoint.upstash.io:6379

# Your generated keys:
WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3h2g1f0e9d8c7b6a5
```

### Step 2: Rename File

Save `.env.complete` as `.env` (remove `.complete`)

---

## 🚀 Run the App

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations to Supabase
pnpm db:migrate

# Seed test data (optional)
pnpm db:seed

# Start server
pnpm dev
```

**Expected output:**
```
✅ Redis connected
✅ Prisma Client initialized
🚀 Server running on port 3000
📱 Game URL: http://localhost:3000
🎮 Webhook: http://localhost:3000/telegram/webhook
```

---

## 🌐 Setup Tunnel & Webhook

**In a NEW terminal:**

```bash
# Start tunnel
pnpm tunnel
```

**You'll see something like:**
```
✅ Tunnel URL: https://abc-123.trycloudflare.com
```

**Copy that URL** and:

1. **Update `.env`:**
   ```env
   APP_BASE_URL=https://abc-123.trycloudflare.com
   ```

2. **Restart server** (Ctrl+C, then `pnpm dev`)

3. **Set webhook:**
   ```bash
   pnpm set:webhook
   ```

**Expected output:**
```
✅ Webhook set successfully!
📊 Webhook Info:
   URL: https://abc-123.trycloudflare.com/telegram/webhook
   Pending updates: 0
   ✅ No errors
```

---

## 🎮 Test Your Bot!

### Complete Telegram Bot Setup

If you haven't already, complete the bot setup in @BotFather:

```
/setinline
```
- Select `chatheist_bot`
- Enter placeholder: "Play Chat Heist"

```
/setjoingroups
```
- Select `chatheist_bot`
- Enable

```
/newgame
```
- Select `chatheist_bot`
- **Short name**: `CHAT_HEIST` (EXACTLY this, case-sensitive)
- **Title**: Chat Heist
- **Description**: Fast, social heist runs for Telegram groups
- **Photo**: Upload 640x360 image (game thumbnail)

### Play the Game!

1. Open your bot: https://t.me/chatheist_bot
2. Send `/start`
3. Tap **"🎮 Play Solo"**
4. Select difficulty
5. Complete a heist!

---

## ✅ Verify Everything Works

### Check Supabase Database

1. Go to: https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/editor
2. Click on **"users"** table
3. You should see your Telegram user!

### Check Upstash Redis

1. Go to: https://console.upstash.com/
2. Click on your database
3. Click **"Data Browser"**
4. You should see session keys

---

## 🐛 Quick Troubleshooting

### "Can't reach database server"

**Check:**
- Did you replace `[REGION]` in DATABASE_URL?
- Is the region correct? (check Supabase dashboard)

**Test:**
```bash
pnpm db:studio
```

If it opens, database is working!

### "Redis connection failed"

**Check:**
- REDIS_URL starts with `rediss://` (double 's')
- Copied the full URL from Upstash
- Upstash database is active

### "Webhook error"

**Check:**
- Server is running (`pnpm dev`)
- Tunnel is running (`pnpm tunnel`)
- APP_BASE_URL in `.env` matches tunnel URL
- Ran `pnpm set:webhook`

---

## 📊 Summary

**What you need to do:**

1. ✅ Find your Supabase region (30 sec)
   - https://app.supabase.com/project/rgmtcjkgbtoxyqwdwpsk/settings/general

2. ✅ Create Upstash Redis (2 min)
   - https://console.upstash.com/

3. ✅ Generate 2 security keys (30 sec)
   - Run command twice

4. ✅ Edit `.env.complete` with those 3 values

5. ✅ Rename to `.env`

6. ✅ Run:
   ```bash
   pnpm install
   pnpm db:migrate
   pnpm dev
   pnpm tunnel
   pnpm set:webhook
   ```

7. ✅ Test in Telegram!

**Total time:** ~5 minutes

---

## 🎉 You're Almost There!

Everything is configured except those 3 values. Complete them and you'll be playing in minutes! 🎭

**Need help?** Check `SUPABASE_SETUP.md` for detailed guides.
