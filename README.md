# Chain Reaction

Local-first personal onchain intelligence dashboard for wallet tracking, token exposure, labels, alerts, and AI-ready reports.

## Quick Start

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Current MVP

- Next.js, TypeScript, Tailwind CSS, Prisma, SQLite.
- Wallet watchlist with EVM address validation.
- Local wallet label database.
- Mock chain adapter for demo/test sync.
- EVM adapter readiness checks for real provider configuration.
- Portfolio dashboard, wallet profiler, token exposure, Smart Money, alerts, AI reports, and settings pages.
- GitHub initialization script through `npm run github:init`.
- Vitest adapter test and GitHub Actions CI.

## Environment

Copy `.env.example` to `.env` and fill only the providers you want to use. The default adapter is `mock`.

```env
DATABASE_URL="file:./dev.db"
CHAIN_REACTION_ADAPTER="mock"
ENABLE_TRADING="false"
```

Secrets are excluded by `.gitignore`.

## Scripts

- `npm run dev` starts the local app.
- `npm run db:init` creates the SQLite database.
- `npm run db:seed` loads demo wallets and synced mock data.
- `npm run github:init` creates and pushes the GitHub repo when `GITHUB_TOKEN` and `GITHUB_OWNER` are configured.
- `npm test` runs unit tests.
- `npm run build` verifies the app build.

## Notes

Trading is disabled for the MVP. No private keys are stored or requested.

The original product/work-order spec is preserved in `CHAIN_REACTION_README.md`.
