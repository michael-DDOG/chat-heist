# 🎭 Welcome to Chat Heist!

Your complete Telegram mini-game is ready. Here's where to start.

---

## 📚 Documentation Quick Links

### Getting Started (Pick One)

1. **[QUICKSTART_SUPABASE.md](QUICKSTART_SUPABASE.md)** ⚡
   - 15-minute setup guide
   - **No Docker required!**
   - Uses Supabase + Upstash (cloud)
   - **Start here if this is your first time**

2. **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** 🗄️
   - Complete Supabase guide
   - Step-by-step cloud setup
   - Upstash Redis configuration
   - Troubleshooting included

3. **[README.md](README.md)** 📖
   - Complete project overview
   - All features explained
   - Architecture details
   - API documentation

### Setup Guides

- **[TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)** 🤖
  - Complete @BotFather walkthrough
  - Bot configuration
  - Game registration
  - Webhook setup
  - Testing checklist

### Deployment

- **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀
  - Production deployment guides
  - Render, Railway, Fly.io, DigitalOcean
  - Custom VPS setup
  - Monitoring & scaling
  - Security checklist

### API & Testing

- **[postman/ChatHeist.postman_collection.json](postman/ChatHeist.postman_collection.json)** 📮
  - Import into Postman
  - Test all API endpoints
  - Includes auth, game, shop, leaderboard

---

## 🎯 What You Have

### ✅ Complete Backend
- Express + TypeScript server
- Telegram bot integration (webhook, commands)
- REST API (auth, game, leaderboard, shop, dailies)
- Prisma ORM + PostgreSQL
- Redis (sessions, rate limits, caching)
- Server-side validation & anti-cheat
- Unit & E2E tests

### ✅ Complete Frontend
- Phaser 3 game (7 scenes)
- Telegram WebApp integration
- Responsive mobile design
- API client with auth
- Global state management

### ✅ Game Features
- Solo & co-op modes
- 5 difficulty levels
- Energy system (refills over time)
- Heat mechanic (betrayal penalty)
- Gear shop with upgrades
- Weekly leaderboards (global + per-chat)
- Daily tasks with rewards
- Anti-cheat protection

### ✅ DevOps
- Docker Compose (local dev)
- Dockerfile (production)
- Database migrations & seeding
- Tunnel script (cloudflared)
- Environment configuration

---

## 🚀 Quick Decision Tree

### "I want to test locally"
→ Follow **[QUICKSTART_SUPABASE.md](QUICKSTART_SUPABASE.md)**

Steps:
1. Create Supabase project (cloud database)
2. Create Upstash Redis (cloud cache)
3. Install dependencies: `pnpm install`
4. Configure .env with cloud URLs
5. Run migrations: `pnpm db:migrate`
6. Start server: `pnpm dev`
7. Start tunnel: `pnpm tunnel`
8. Set webhook: `pnpm set:webhook`
9. Play!

**Time:** 15 minutes
**Docker:** Not needed!

---

### "I want to deploy to production"
→ Follow **[DEPLOYMENT.md](DEPLOYMENT.md)**

Choose platform:
- **Render** (easiest, free tier)
- **Railway** (fast, great DX)
- **Fly.io** (edge compute)
- **VPS** (full control)

**Time:** 20-30 minutes

---

### "I want to understand the code"
→ Start with **[README.md](README.md)** → Project Structure

Then explore:
```
src/
├── server.ts          # Entry point
├── bot/               # Telegram integration
├── api/               # REST endpoints
├── core/              # Game logic & scoring
└── db/                # Database

web/src/
├── main.ts            # Phaser init
├── game/              # Game scenes
│   ├── HeistScene.ts  # Main gameplay
│   └── ...
└── net/api.ts         # Backend API client
```

---

### "I want to customize the game"
→ Edit **[src/core/constants.ts](src/core/constants.ts)**

Change:
- Energy refill rate
- Difficulty multipliers
- Gear costs
- Reward amounts
- Heat penalties

Then restart server: `pnpm dev`

---

### "I need help with Telegram setup"
→ Follow **[TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)**

Covers:
- Creating bot
- Enabling features
- Registering game
- Setting webhook
- Troubleshooting

---

## 🎮 Test Checklist

Before deploying, verify:

- [ ] Local setup works
- [ ] Bot responds to `/start`
- [ ] Game loads in WebView
- [ ] Can complete full heist
- [ ] Score saves correctly
- [ ] Leaderboard updates
- [ ] Shop loads and works
- [ ] Works in group chat
- [ ] Multiple players can join
- [ ] All tests pass: `pnpm test`

---

## 🐛 Common Issues & Solutions

### Bot not responding
→ Check webhook status:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

### Game not loading
→ Check browser console (F12) for errors
→ Verify `APP_BASE_URL` in `.env`

### Database errors
→ Reset database:
```bash
pnpm db:push --force-reset
pnpm db:dev
```

### Authentication fails
→ Verify `TELEGRAM_BOT_TOKEN` in `.env`
→ Check server logs

**More help:** See troubleshooting sections in each guide

---

## 📊 Project Stats

- **Files**: 50+ TypeScript/React files
- **Lines of Code**: ~8,000+
- **Test Coverage**: Core game logic
- **Documentation**: 6 comprehensive guides
- **API Endpoints**: 15+ routes
- **Database Tables**: 8 models
- **Game Scenes**: 7 Phaser scenes

---

## 🎯 Recommended Path

### For Beginners
1. Read [QUICKSTART_SUPABASE.md](QUICKSTART_SUPABASE.md)
2. Setup Supabase + Upstash (free accounts)
3. Test locally (no Docker!)
4. Read [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)
5. Explore code structure
6. Make small changes
7. Deploy to Render (free)

### For Experienced Developers
1. Clone → `pnpm install`
2. Scan [README.md](README.md)
3. Supabase + Upstash setup
4. `pnpm db:migrate` → run → deploy
5. Customize via `constants.ts`
6. Scale as needed

---

## 🛠 Development Commands

```bash
# Install
pnpm install

# Database (Supabase)
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes (dev)
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed test data

# Development
pnpm dev              # Start backend
pnpm tunnel           # Start cloudflared tunnel
pnpm set:webhook      # Set Telegram webhook

# Testing
pnpm test             # Unit tests
pnpm test:e2e         # E2E tests
pnpm test:watch       # Watch mode

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Linting
pnpm lint             # Check code style
pnpm format           # Format code
```

---

## 🎨 Customization Ideas

### Easy
- Change difficulty multipliers
- Adjust energy refill time
- Modify gear costs
- Update reward amounts

### Medium
- Add new mini-game types
- Create new gear items
- Add sound effects
- Design new scenes

### Advanced
- Implement clan system
- Add tournaments
- Create events
- Build admin dashboard
- Add analytics

---

## 📦 What's Included

```
chat-heist/
├── src/              # Backend TypeScript
├── web/              # Phaser 3 game
├── prisma/           # Database schema
├── tests/            # Unit & E2E tests
├── postman/          # API collection
├── scripts/          # Dev tools
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── 📚 Documentation/
    ├── README.md
    ├── QUICKSTART.md
    ├── GETTING_STARTED.md
    ├── TELEGRAM_SETUP.md
    ├── DEPLOYMENT.md
    └── START_HERE.md (you are here)
```

---

## 🤝 Need Help?

1. **Check documentation** - Your issue is likely covered
2. **Search code** - Well-commented, easy to navigate
3. **Check logs** - `pnpm dev` shows detailed errors
4. **Postman collection** - Test APIs directly
5. **GitHub issues** - Report bugs or request features

---

## 🎉 You're Ready!

Pick a guide and start building:

- 🏃 **Quick start**: [QUICKSTART.md](QUICKSTART.md)
- 📚 **Learn**: [GETTING_STARTED.md](GETTING_STARTED.md)
- 🤖 **Telegram**: [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)
- 🚀 **Deploy**: [DEPLOYMENT.md](DEPLOYMENT.md)

**Happy heisting! 🎭💰**

---

## 📝 License

MIT - See [LICENSE](LICENSE)

Built with ❤️ using:
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Phaser 3](https://phaser.io/)
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
