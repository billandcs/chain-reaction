PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "name" TEXT NOT NULL,
    "trackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "manualScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "WalletLabel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT,
    "address" TEXT,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 70,
    "notes" TEXT,
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WalletLabel_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "logoUrl" TEXT,
    "coingeckoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "TokenBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "usdValue" REAL,
    "blockNumber" INTEGER,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TokenBalance_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TokenBalance_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "hash" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT,
    "valueNative" REAL NOT NULL DEFAULT 0,
    "gasFeeNative" REAL,
    "blockNumber" INTEGER,
    "timestamp" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "hash" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "amount" REAL NOT NULL,
    "usdValue" REAL,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "Transfer_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transfer_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfer_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PriceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    "priceUsd" REAL NOT NULL,
    "change24h" REAL,
    "liquidityUsd" REAL,
    "volume24hUsd" REAL,
    "marketCapUsd" REAL,
    "source" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceSnapshot_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PortfolioSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT,
    "totalValueUsd" REAL NOT NULL,
    "chainBreakdown" TEXT NOT NULL,
    "tokenBreakdown" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioSnapshot_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AlertRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "thresholdUsd" REAL,
    "tokenAddress" TEXT,
    "walletId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "AlertEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "readAt" DATETIME,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AiReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citationsJson" TEXT NOT NULL DEFAULT '[]',
    "model" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SyncJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "adapter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "message" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SyncJob_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Wallet_chain_idx" ON "Wallet"("chain");
CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_chain_address_key" ON "Wallet"("chain", "address");
CREATE INDEX IF NOT EXISTS "WalletLabel_walletId_idx" ON "WalletLabel"("walletId");
CREATE INDEX IF NOT EXISTS "WalletLabel_chain_address_idx" ON "WalletLabel"("chain", "address");
CREATE INDEX IF NOT EXISTS "WalletLabel_type_idx" ON "WalletLabel"("type");
CREATE INDEX IF NOT EXISTS "Token_symbol_idx" ON "Token"("symbol");
CREATE UNIQUE INDEX IF NOT EXISTS "Token_chain_address_key" ON "Token"("chain", "address");
CREATE INDEX IF NOT EXISTS "TokenBalance_tokenId_idx" ON "TokenBalance"("tokenId");
CREATE UNIQUE INDEX IF NOT EXISTS "TokenBalance_walletId_tokenId_key" ON "TokenBalance"("walletId", "tokenId");
CREATE INDEX IF NOT EXISTS "Transaction_walletId_timestamp_idx" ON "Transaction"("walletId", "timestamp");
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_chain_hash_walletId_key" ON "Transaction"("chain", "hash", "walletId");
CREATE INDEX IF NOT EXISTS "Transfer_timestamp_idx" ON "Transfer"("timestamp");
CREATE INDEX IF NOT EXISTS "Transfer_fromWalletId_idx" ON "Transfer"("fromWalletId");
CREATE INDEX IF NOT EXISTS "Transfer_toWalletId_idx" ON "Transfer"("toWalletId");
CREATE UNIQUE INDEX IF NOT EXISTS "Transfer_chain_hash_tokenId_fromAddress_toAddress_key" ON "Transfer"("chain", "hash", "tokenId", "fromAddress", "toAddress");
CREATE INDEX IF NOT EXISTS "PriceSnapshot_tokenId_capturedAt_idx" ON "PriceSnapshot"("tokenId", "capturedAt");
CREATE INDEX IF NOT EXISTS "PortfolioSnapshot_walletId_capturedAt_idx" ON "PortfolioSnapshot"("walletId", "capturedAt");
CREATE INDEX IF NOT EXISTS "AlertEvent_ruleId_createdAt_idx" ON "AlertEvent"("ruleId", "createdAt");
CREATE INDEX IF NOT EXISTS "AiReport_subjectType_subjectId_idx" ON "AiReport"("subjectType", "subjectId");
CREATE INDEX IF NOT EXISTS "SyncJob_walletId_createdAt_idx" ON "SyncJob"("walletId", "createdAt");
CREATE INDEX IF NOT EXISTS "SyncJob_status_idx" ON "SyncJob"("status");

PRAGMA foreign_keys=ON;
