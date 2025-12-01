# Chat Heist - Setup & Launch Checklist

Use this checklist to track your progress from setup to production.

---

## 📋 Initial Setup

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Docker Desktop installed and running
- [ ] Cloudflared or ngrok installed
- [ ] Telegram account created
- [ ] Git installed (for deployment)

### Code Setup
- [ ] Repository cloned/downloaded
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env` file created from `.env.example`
- [ ] README.md reviewed

---

## 🤖 Telegram Bot Configuration

### BotFather Setup
- [ ] Created new bot via `/newbot`
- [ ] Saved bot token
- [ ] Saved bot username
- [ ] Enabled inline mode (`/setinline`)
- [ ] Enabled group joining (`/setjoingroups`)
- [ ] Created game via `/newgame`
- [ ] Set game short name to `CHAT_HEIST`
- [ ] Uploaded game photo (512x512)
- [ ] Set bot description (`/setdescription`)
- [ ] Set bot about text (`/setabouttext`)
- [ ] Set bot commands (`/setcommands`)

### Environment Configuration
- [ ] `TELEGRAM_BOT_TOKEN` set in `.env`
- [ ] `TELEGRAM_BOT_USERNAME` set in `.env`
- [ ] `TELEGRAM_GAME_SHORT_NAME` set to `CHAT_HEIST`
- [ ] Generated random `WEBHOOK_SECRET`
- [ ] Generated random `JWT_SECRET` (min 32 chars)

---

## 🗄️ Database & Services

### Local Development
- [ ] Docker Compose up (`docker compose up -d`)
- [ ] PostgreSQL running (check `docker compose ps`)
- [ ] Redis running (check `docker compose ps`)
- [ ] Database initialized (`pnpm db:dev`)
- [ ] Seed data loaded (verify in logs)

### Database Verification
- [ ] Can connect to Prisma Studio (`pnpm db:studio`)
- [ ] See test users in database
- [ ] See test chat in database
- [ ] See sample runs in database

---

## 🖥️ Server Setup

### Backend
- [ ] Server starts without errors (`pnpm dev`)
- [ ] See "Server running on port 3000" message
- [ ] Health endpoint works (`curl localhost:3000/health`)
- [ ] No error messages in console

### Tunnel
- [ ] Tunnel running (`pnpm tunnel`)
- [ ] Public HTTPS URL obtained
- [ ] `APP_BASE_URL` updated in `.env`
- [ ] Backend restarted after URL change
- [ ] Tunnel URL accessible externally

---

## 🔗 Webhook Configuration

### Set Webhook
- [ ] Webhook set via curl/Postman
- [ ] Response shows `"ok": true`
- [ ] Webhook info verified (`getWebhookInfo`)
- [ ] URL matches tunnel URL
- [ ] No `last_error_message` in webhook info
- [ ] `pending_update_count` is 0

### Verify Connection
- [ ] Send message to bot in Telegram
- [ ] See incoming webhook in server logs
- [ ] Bot responds to message
- [ ] No authentication errors

---

## 🎮 Game Testing

### Solo Mode
- [ ] Bot responds to `/start`
- [ ] "Play Solo" button appears
- [ ] Game loads in WebView
- [ ] Authentication succeeds
- [ ] User stats display correctly
- [ ] Can select difficulty
- [ ] Heist starts (60s gameplay)
- [ ] Tapping increases score
- [ ] Events complete correctly
- [ ] Escape round loads (10s)
- [ ] Results screen appears
- [ ] Score submits successfully
- [ ] Coins awarded
- [ ] Energy decreases

### Commands
- [ ] `/start` works
- [ ] `/play` works
- [ ] `/top` works and shows leaderboard
- [ ] `/link` works and shows profile
- [ ] `/heist` works in groups

### Shop
- [ ] Shop loads from menu
- [ ] Gear list displays
- [ ] Current coins shown
- [ ] Can purchase gear (if enough coins)
- [ ] Coins deduct correctly
- [ ] Gear level increases

### Leaderboard
- [ ] `/top` shows rankings
- [ ] Score appears after run
- [ ] Rankings update after better score
- [ ] User rank shown

### Daily Tasks
- [ ] Tasks appear (3 per day)
- [ ] Progress tracked
- [ ] Can claim completed tasks
- [ ] Rewards awarded

---

## 👥 Group Testing

### Group Setup
- [ ] Bot added to test group
- [ ] Bot has necessary permissions
- [ ] `/heist` command works in group

### Co-op Mode
- [ ] Lobby message appears
- [ ] "Join" button visible
- [ ] Multiple users can join
- [ ] Host can start
- [ ] Game launches for all players
- [ ] Scores save individually
- [ ] Leaderboard shows chat rankings

---

## 🧪 Testing

### Automated Tests
- [ ] Unit tests pass (`pnpm test`)
- [ ] InitData verification tests pass
- [ ] Scoring tests pass
- [ ] E2E tests pass (`pnpm test:e2e`)

### Manual Testing
- [ ] Tested in mobile browser
- [ ] Tested in Telegram mobile app
- [ ] Tested in Telegram desktop app
- [ ] Tested with multiple users
- [ ] Tested all difficulty levels
- [ ] Tested error scenarios
- [ ] Tested rate limiting

---

## 🔐 Security Verification

### Authentication
- [ ] InitData verification working
- [ ] Invalid tokens rejected
- [ ] Expired sessions rejected
- [ ] JWT secrets set and secure

### Anti-Cheat
- [ ] Score validation active
- [ ] Impossible scores rejected
- [ ] Nonce replay prevention working
- [ ] Rate limits enforced
- [ ] Pattern detection active

### Data Protection
- [ ] No secrets in code
- [ ] Environment variables used
- [ ] Database credentials secure
- [ ] Bot token not exposed

---

## 📊 Monitoring Setup

### Logging
- [ ] Server logs working
- [ ] Error logs captured
- [ ] Authentication failures logged
- [ ] Validation failures logged
- [ ] Rate limit hits logged

### Health Checks
- [ ] `/health` endpoint working
- [ ] Database connection verified
- [ ] Redis connection verified
- [ ] Webhook receiving updates

---

## 🚀 Production Deployment

### Pre-Deploy
- [ ] All local tests pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Code reviewed
- [ ] Documentation updated

### Platform Selection
- [ ] Deployment platform chosen
- [ ] Account created
- [ ] Billing configured (if needed)
- [ ] Domain/subdomain ready (if using)

### Deploy to Platform
- [ ] Repository connected
- [ ] Environment variables set
- [ ] PostgreSQL database created
- [ ] Redis instance created
- [ ] Build succeeds
- [ ] Application starts
- [ ] Migrations run
- [ ] Seeds applied (optional)

### Production Configuration
- [ ] `APP_BASE_URL` set to production URL
- [ ] `NODE_ENV` set to `production`
- [ ] `WEBHOOK_SECRET` set (new, different from dev)
- [ ] `JWT_SECRET` set (new, different from dev)
- [ ] Database URL configured
- [ ] Redis URL configured

### Production Webhook
- [ ] Webhook set to production URL
- [ ] Webhook info verified
- [ ] No errors in webhook info
- [ ] Test message sent to bot
- [ ] Bot responds in production

---

## ✅ Production Verification

### Functionality
- [ ] Bot responds to commands
- [ ] Game loads correctly
- [ ] Users can authenticate
- [ ] Games complete successfully
- [ ] Scores save correctly
- [ ] Leaderboards update
- [ ] Shop works
- [ ] Daily tasks work
- [ ] Group mode works

### Performance
- [ ] Load time acceptable (<3s)
- [ ] Game responsive
- [ ] No lag during gameplay
- [ ] Scores submit quickly

### Stability
- [ ] No crashes during testing
- [ ] Memory usage stable
- [ ] Database queries fast
- [ ] No error spikes

---

## 📈 Post-Launch

### Monitoring
- [ ] Health check monitoring set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring active
- [ ] Database backups configured
- [ ] Alert notifications set up

### Maintenance
- [ ] Weekly leaderboard reset scheduled
- [ ] Database backup schedule confirmed
- [ ] Log rotation configured
- [ ] Update plan established

### Growth
- [ ] User feedback collected
- [ ] Analytics reviewed
- [ ] Performance optimized
- [ ] New features planned

---

## 🎉 Launch Checklist

### Final Verification
- [ ] All above items checked
- [ ] Tested by multiple users
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Support plan ready

### Go Live
- [ ] Announcement prepared
- [ ] Share link ready: `https://t.me/<BOT>?game=CHAT_HEIST`
- [ ] Group promotion planned
- [ ] Feedback channels ready

### Post-Launch Monitoring
- [ ] Check logs first 24h
- [ ] Monitor user count
- [ ] Watch for errors
- [ ] Respond to feedback
- [ ] Prepare hotfixes if needed

---

## 📝 Notes & Issues

Use this space to track issues or notes during setup:

```
Date: ___________
Issue:
Resolution:

Date: ___________
Issue:
Resolution:

Date: ___________
Issue:
Resolution:
```

---

## 🎯 Success Criteria

Your launch is successful when:

✅ Bot is live and responding
✅ Users can play games
✅ Scores save correctly
✅ Leaderboards work
✅ No critical errors
✅ Performance is acceptable
✅ Users are having fun!

---

**Congratulations! You've successfully launched Chat Heist! 🎭💰**

Keep this checklist for future updates and troubleshooting.
