# Telegram Bot & Game Setup Guide

Complete guide to setting up your Telegram bot and game integration.

---

## Part 1: Create Bot in @BotFather

### Step 1: Create New Bot

Open [@BotFather](https://t.me/BotFather) and send:

```
/newbot
```

**BotFather will ask:**
- **Name**: Choose display name (e.g., "Chat Heist Game")
- **Username**: Choose unique username ending in "bot" (e.g., "mychatheist_bot")

**✅ Save the bot token** that looks like:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
```

---

### Step 2: Enable Inline Mode

This allows users to share the game in chats.

```
/setinline
```

- Select your bot
- Send any placeholder text (e.g., "Search heists")

---

### Step 3: Enable Group Adding

This allows adding bot to group chats for co-op mode.

```
/setjoingroups
```

- Select your bot
- Choose **Enable**

---

### Step 4: Create the Game

**Important:** This registers your game with Telegram.

```
/newgame
```

- **Select your bot**
- **Short name**: `CHAT_HEIST` (must be uppercase, no spaces, unique)
- **Title**: Chat Heist
- **Description**:
  ```
  Fast, social heist runs for Telegram groups.
  Tap to crack vaults, escape guards, and climb leaderboards!
  ```
- **Photo**: Upload a 512x512 image (heist-themed)
  - Can be a simple icon or graphic
  - Recommended: Use a vault, mask, or money bag icon
- **Animation**: Skip for now (optional GIF)

**✅ Remember the short name:** `CHAT_HEIST` (must match `TELEGRAM_GAME_SHORT_NAME` in `.env`)

---

### Step 5: Optional but Recommended Settings

#### Set Bot Description (shown in bot profile)
```
/setdescription
```
- Select your bot
- Send:
  ```
  🎭 Chat Heist - Fast, social heist runs for groups

  Tap actions, crack vaults, escape guards. Upgrade your gear and climb the leaderboards. Betray your crew for extra loot... if you dare.

  Commands:
  /start - Start playing
  /heist - Start group heist
  /top - View leaderboard
  /link - Your stats
  ```

#### Set About Text (shown in chat list)
```
/setabouttext
```
- Select your bot
- Send:
  ```
  Fast heist runs for Telegram groups. Play solo or with friends!
  ```

#### Set Bot Picture (optional)
```
/setuserpic
```
- Select your bot
- Upload an image

#### Set Bot Commands (for autocomplete)
```
/setcommands
```
- Select your bot
- Send:
  ```
  start - Start the game
  play - Play solo heist
  heist - Start group heist
  top - View leaderboard
  link - View your account
  ```

---

## Part 2: Configure Your Application

### Step 1: Update .env

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=mychatheist_bot
TELEGRAM_GAME_SHORT_NAME=CHAT_HEIST
```

### Step 2: Set Webhook

After starting your server and tunnel, run:

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

### Step 3: Verify Webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Expected response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://abc-123.trycloudflare.com/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

**If you see `last_error_message`:**
- Check that your server is running
- Verify tunnel is active
- Check backend logs for errors

---

## Part 3: Test Your Bot

### Test 1: Basic Commands

1. Open your bot in Telegram
2. Send `/start`
3. ✅ Bot should respond with welcome message and "Play" button

### Test 2: Solo Game

1. Tap "🎮 Play Solo" button
2. ✅ Game should load in WebView
3. Select difficulty and play
4. ✅ Score should submit and show results

### Test 3: Deep Link

Open this URL (replace `<YOUR_BOT_USERNAME>`):
```
https://t.me/<YOUR_BOT_USERNAME>?game=CHAT_HEIST
```

✅ Should launch the game directly

### Test 4: Group Chat

1. Create a test group
2. Add your bot to the group
3. Send `/heist`
4. ✅ Bot should create lobby with "Join" button
5. Have another user join
6. ✅ Game should start for both players

---

## Part 4: Troubleshooting

### Bot doesn't respond to commands

**Check 1: Webhook Status**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

If `last_error_message` appears:
1. Verify server is running (`pnpm dev`)
2. Verify tunnel is running (`pnpm tunnel`)
3. Check server logs for errors
4. Try deleting and re-setting webhook

**Check 2: Bot Privacy**
In groups, bot must be:
- Added as member
- Given admin rights (if required)
- Privacy mode OFF (BotFather → `/setprivacy` → Disable)

### Game doesn't load

**Check 1: initData verification**
- Look for authentication errors in server logs
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check browser console (F12) for errors

**Check 2: CORS**
- Verify server allows cross-origin requests
- Check `APP_BASE_URL` matches tunnel URL

**Check 3: WebApp Script**
- Verify Telegram WebApp script is loaded in HTML
- Check `window.Telegram.WebApp` exists in browser console

### Webhook keeps failing

**Common issues:**
1. **Tunnel expired**: Restart tunnel, update webhook with new URL
2. **Server crashed**: Check logs, restart server
3. **Wrong URL**: Verify webhook URL includes `/telegram/webhook`
4. **Certificate issues**: Use HTTPS (tunnels provide this)

**Delete and reset webhook:**
```bash
# Delete
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Set again
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"<NEW_URL>/telegram/webhook"}'
```

---

## Part 5: Advanced Configuration

### Custom Domain (Production)

1. Deploy to production server
2. Get domain (e.g., `game.mysite.com`)
3. Set webhook to: `https://game.mysite.com/telegram/webhook`
4. Update `APP_BASE_URL` in production env

### Bot Menu Button

Set a custom menu button that launches the game:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "🎮 Play Heist",
      "web_app": {
        "url": "https://your-app.com"
      }
    }
  }'
```

### Inline Query Results

Your bot already supports inline mode. Users can type:
```
@your_heist_bot
```

And your bot will return the game to share in any chat.

---

## Part 6: Testing Checklist

- [ ] Bot responds to `/start`
- [ ] Bot responds to `/play`
- [ ] Bot responds to `/heist` in groups
- [ ] Bot responds to `/top`
- [ ] Bot responds to `/link`
- [ ] Game loads in WebView
- [ ] Authentication works
- [ ] Can complete a full heist run
- [ ] Score submits successfully
- [ ] Leaderboard updates
- [ ] Shop loads and works
- [ ] Daily tasks appear
- [ ] Works in group chat
- [ ] Multiple users can play together
- [ ] Deep link works: `https://t.me/<BOT>?game=CHAT_HEIST`

---

## Part 7: Going Live

### Pre-launch Checklist

- [ ] Test all features thoroughly
- [ ] Deploy to production server
- [ ] Set production webhook
- [ ] Monitor error logs
- [ ] Test with real users
- [ ] Verify database backups
- [ ] Check rate limits are working
- [ ] Verify anti-cheat is active

### Post-launch

1. **Monitor webhook health**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. **Check logs regularly**
   - Authentication failures
   - Validation errors
   - Rate limit hits
   - Flagged users

3. **Track metrics**
   - Daily active users
   - Games played
   - Average score
   - Top players

---

## Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Games Platform](https://core.telegram.org/bots/games)
- [Telegram WebApps](https://core.telegram.org/bots/webapps)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)

---

**Need help? Check the [QUICKSTART.md](QUICKSTART.md) or [README.md](README.md)**
