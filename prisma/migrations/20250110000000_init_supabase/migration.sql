-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "RunMode" AS ENUM ('SOLO', 'COOP');

-- CreateEnum
CREATE TYPE "GearType" AS ENUM ('HACKER_RIG', 'DRILL', 'GETAWAY', 'MASK');

-- CreateEnum
CREATE TYPE "LeaderboardScope" AS ENUM ('CHAT', 'GLOBAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tgUserId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "energy" INTEGER NOT NULL DEFAULT 5,
    "heat" INTEGER NOT NULL DEFAULT 0,
    "gearLvl" INTEGER NOT NULL DEFAULT 1,
    "coinsTotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tgChatId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "chatId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "mode" "RunMode" NOT NULL DEFAULT 'SOLO',
    "score" INTEGER NOT NULL DEFAULT 0,
    "cashEarned" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "betrayUsed" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" INTEGER NOT NULL,
    "seed" TEXT,
    "nonce" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "gear" "GearType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" "LeaderboardScope" NOT NULL,
    "chatId" UUID,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "bestScore" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskType" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "daily_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tgUserId_key" ON "users"("tgUserId");

-- CreateIndex
CREATE INDEX "users_tgUserId_idx" ON "users"("tgUserId");

-- CreateIndex
CREATE UNIQUE INDEX "chats_tgChatId_key" ON "chats"("tgChatId");

-- CreateIndex
CREATE INDEX "chats_tgChatId_idx" ON "chats"("tgChatId");

-- CreateIndex
CREATE INDEX "runs_userId_finishedAt_idx" ON "runs"("userId", "finishedAt");

-- CreateIndex
CREATE INDEX "runs_chatId_finishedAt_idx" ON "runs"("chatId", "finishedAt");

-- CreateIndex
CREATE INDEX "inventory_userId_idx" ON "inventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_userId_gear_key" ON "inventory"("userId", "gear");

-- CreateIndex
CREATE INDEX "leaderboard_scope_chatId_weekStartDate_bestScore_idx" ON "leaderboard"("scope", "chatId", "weekStartDate", "bestScore");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_scope_chatId_weekStartDate_userId_key" ON "leaderboard"("scope", "chatId", "weekStartDate", "userId");

-- CreateIndex
CREATE INDEX "daily_tasks_userId_date_idx" ON "daily_tasks"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_tasks_userId_date_taskType_key" ON "daily_tasks"("userId", "date", "taskType");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_expiresAt_idx" ON "sessions"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_key_key" ON "rate_limits"("key");

-- CreateIndex
CREATE INDEX "rate_limits_key_windowStart_idx" ON "rate_limits"("key", "windowStart");

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Disable RLS on bot tables (server-to-server only)
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "chats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "runs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "leaderboard" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_tasks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" DISABLE ROW LEVEL SECURITY;
