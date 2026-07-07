# Chain Reaction

Chain Reaction is a local-first personal onchain intelligence dashboard for tracking wallets, token flows, portfolio exposure, Smart Money-style labels, alerts, and AI-generated analysis.

The project is inspired by professional onchain analytics workflows, but it is designed for personal local use. It should not depend on proprietary wallet-label datasets. Instead, it builds a user's own local intelligence layer from public chain data, user-defined labels, open APIs, and optional AI summaries.

## Product Goal

Build a local web application that helps an onchain investor answer:

- Which watched wallets are moving funds?
- Which tokens are being accumulated or sold?
- What changed in my portfolio since the last sync?
- Which wallets should I treat as Smart Money, whales, exchanges, funds, or risks?
- Which unusual flows deserve attention?
- What does the available local data suggest, without switching between multiple tools?

## Core Principles

- Local-first by default.
- Personal wallet labels are owned by the user.
- Secrets must never be committed to GitHub.
- The MVP should analyze and monitor before attempting any trade execution.
- Data adapters should be replaceable.
- AI summaries must cite or point back to local data used for the answer.
- Direct trading is out of scope for MVP and must remain behind a disabled feature flag.

## Recommended Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand or Jotai
- Recharts or ECharts

### Backend

- Node.js
- TypeScript
- Next.js API routes or Fastify
- Prisma ORM
- SQLite for local MVP
- PostgreSQL-ready data model for future upgrade
- Background jobs through node-cron, BullMQ, or a simple local scheduler

### Data Sources

Recommended public data providers:

- Alchemy
- Etherscan
- Covalent
- Moralis
- Bitquery
- CoinGecko
- DexScreener
- GeckoTerminal
- Public RPC fallback

Initial chain support should prioritize Ethereum or Base, then expand to Solana, Arbitrum, Optimism, Polygon, and BNB Chain.

### AI Layer

- OpenAI API or local LLM
- AI reports for wallet summaries, token summaries, abnormal flows, and daily briefings
- Retrieval should use local database records, not broad hallucinated market claims

### GitHub Integration

- GitHub Personal Access Token or OAuth
- GitHub REST API or `gh` CLI
- Automatic repo creation
- Automatic remote setup
- Initial commit and push
- CI workflow creation

Default repository name:

```text
chain-reaction
```

Default product name:

```text
Chain Reaction
```

## High-Level Architecture

```text
Chain Reaction
├── Web App
│   ├── Dashboard
│   ├── Wallets
│   ├── Wallet Profiler
│   ├── Tokens
│   ├── Token Flow
│   ├── Smart Money
│   ├── Alerts
│   ├── AI Reports
│   └── Settings
├── API Layer
│   ├── Wallet API
│   ├── Token API
│   ├── Portfolio API
│   ├── Alert API
│   ├── AI Report API
│   └── GitHub Setup API or Script
├── Data Layer
│   ├── Prisma
│   ├── SQLite
│   └── Local backup/export
├── Sync Workers
│   ├── Chain sync
│   ├── Price sync
│   ├── Alert evaluation
│   └── Portfolio snapshots
├── Adapters
│   ├── Chain adapters
│   ├── Price adapters
│   ├── Explorer adapters
│   └── AI adapters
└── GitHub Automation
    ├── Create repo
    ├── Configure remote
    ├── Push scaffold
    └── Create CI workflow
```

## Data Model

The MVP should include these core tables:

- `Wallet`
- `WalletLabel`
- `Token`
- `TokenBalance`
- `Transaction`
- `Transfer`
- `PriceSnapshot`
- `PortfolioSnapshot`
- `AlertRule`
- `AlertEvent`
- `AiReport`
- `SyncJob`

Suggested future tables:

- `Counterparty`
- `TokenFlowSnapshot`
- `WalletScore`
- `Watchlist`
- `ApiCredentialStatus`
- `BackupExport`

## Chain Adapter Interface

All chain integrations should implement a common interface.

```ts
interface ChainAdapter {
  getWalletBalances(address: string): Promise<TokenBalance[]>;
  getTransactions(address: string, cursor?: string): Promise<Transaction[]>;
  getTokenTransfers(address: string, cursor?: string): Promise<Transfer[]>;
  getTokenMetadata(tokenAddress: string): Promise<Token>;
}
```

Acceptance requirements:

- At least one real EVM adapter.
- One mock adapter for tests and demo data.
- Clear error states for missing API keys, rate limits, unsupported chains, and invalid addresses.

## Milestones And Work Orders

## Milestone 0: Project Initialization

### CR-001: GitHub Repo Automation

Goal:

Create a new GitHub repository and connect the local project to it.

Deliverables:

- GitHub token configuration.
- GitHub repo creation script.
- Default repo name: `chain-reaction`.
- Public/private option.
- Automatic README, `.gitignore`, and license initialization.
- Local git remote setup.
- Initial commit and push.

Acceptance criteria:

- `npm run github:init` creates the repo.
- GitHub shows a `Chain Reaction` repository.
- Local `origin` points to the created repo.
- Initial commit pushes successfully.
- Secrets are not committed.

### CR-002: Project Scaffold

Goal:

Create the local web app foundation.

Deliverables:

- Next.js app.
- TypeScript.
- Tailwind CSS.
- Prisma.
- SQLite.
- ESLint.
- Prettier.
- `.env.example`.
- Basic app layout.

Acceptance criteria:

- `npm install` works.
- `npm run dev` starts the app.
- Local dashboard shell loads successfully.

### CR-003: Local Settings Center

Goal:

Allow the user to configure API keys, RPC URLs, and GitHub access.

Deliverables:

- Settings page.
- Environment variable loader.
- API key status checks.
- RPC connection test.
- GitHub connection test.

Acceptance criteria:

- User can see provider readiness.
- Failed connections show clear errors.
- Secrets are excluded from git.

## Milestone 1: Data Model And Wallet Tracking

### CR-010: Prisma Schema And Database Design

Goal:

Define the core database schema.

Deliverables:

- Prisma schema.
- SQLite migration.
- Seed script with demo wallets and tokens.
- Repository functions for core entities.

Acceptance criteria:

- Migration runs successfully.
- SQLite database is created.
- Seed data loads.
- Basic queries work.

### CR-011: Wallet Watchlist

Goal:

Allow users to add wallets for tracking.

Deliverables:

- Add wallet.
- Edit wallet.
- Delete wallet.
- Chain selection.
- Custom name.
- Label assignment.
- Tracking enabled/disabled flag.
- Search and filter.

Default label types:

- Smart Money
- Whale
- CEX
- Fund
- VC
- Scammer
- Friend
- Custom

Acceptance criteria:

- User can manage wallet watchlist.
- Address validation works.
- Wallet list supports filtering by chain and label.

### CR-012: Wallet Profiler MVP

Goal:

Create a personal wallet profile page.

Deliverables:

- Wallet overview.
- Token balances.
- Recent transactions.
- Transaction count.
- First activity time.
- Latest activity time.
- Top tokens.
- Manual sync button.

Acceptance criteria:

- User can open a wallet profile.
- Manual sync writes data to the database.
- Empty and error states are handled.

## Milestone 2: Onchain Data Sync

### CR-020: Chain Adapter Interface

Goal:

Create replaceable chain data adapters.

Deliverables:

- Adapter interface.
- Adapter registry.
- Mock adapter.
- Provider readiness checks.

Acceptance criteria:

- App can switch between mock and real adapters.
- Tests can run without real API keys.

### CR-021: Ethereum Or Base Data Sync

Goal:

Implement the first EVM chain sync.

Preferred provider order:

1. Alchemy
2. Etherscan
3. Covalent
4. Public RPC fallback

Deliverables:

- ERC-20 balance sync.
- Native token balance sync.
- Transfers sync.
- Transactions sync.
- Sync job status.

Acceptance criteria:

- A configured wallet returns recent transactions.
- Token balances display correctly.
- Sync failures are recorded with useful messages.

### CR-022: Price Data Adapter

Goal:

Fetch token price and market data.

Providers:

- CoinGecko.
- DexScreener.
- GeckoTerminal fallback.

Deliverables:

- Token price.
- 24h change.
- Liquidity.
- Volume.
- Market cap when available.

Acceptance criteria:

- Portfolio values can be shown in USD.
- Token detail pages show price data.
- API failure states are visible.

## Milestone 3: Portfolio And Flow Analysis

### CR-030: Portfolio Dashboard

Goal:

Create the main personal asset dashboard.

Deliverables:

- Total portfolio value.
- Chain breakdown.
- Token breakdown.
- Top holdings.
- Recent inflows.
- Recent outflows.
- 24h and 7d changes.
- Watchlist summary.

Acceptance criteria:

- Dashboard shows core metrics.
- Charts render correctly.
- Empty states guide the user to add wallets.

### CR-031: Wallet Flow Explorer

Goal:

Analyze inflows and outflows for a watched wallet.

Deliverables:

- Incoming transfers.
- Outgoing transfers.
- Counterparty wallet.
- Counterparty label.
- Token amount.
- USD value.
- Time filter.
- Chain filter.
- Sorting by value and time.

Acceptance criteria:

- User can inspect wallet flows.
- Counterparties are clickable.
- Labels appear anywhere a wallet appears.

### CR-032: Token Flow Page

Goal:

Build a personal Token God Mode-style page.

Deliverables:

- Token overview.
- Watched wallet exposure.
- Watched wallets buying.
- Watched wallets selling.
- User-labeled exchange or fund wallet flows.
- Top inflow wallets.
- Top outflow wallets.
- Price chart.
- Flow chart.

Acceptance criteria:

- User can create a token page from an address.
- User can see which watched wallets hold, buy, or sell the token.
- Price and flow can be analyzed side by side.

## Milestone 4: Smart Money And Label System

### CR-040: Local Wallet Label Database

Goal:

Create a user-owned wallet labeling system.

Deliverables:

- Manual label creation.
- Label type.
- Confidence score.
- Notes.
- Source URL.
- CSV import.
- CSV export.
- Bulk upload.

Acceptance criteria:

- User can build a personal Smart Money list.
- Labels appear in transactions, flows, and profile pages.
- Labels can be backed up and restored.

### CR-041: Smart Wallet Scoring

Goal:

Create a basic wallet score without proprietary label data.

Initial scoring factors:

- Wallet age.
- Transaction frequency.
- Large flow history.
- Holding concentration.
- Early token discovery placeholder.
- Realized profit placeholder.
- Manual user score.

Deliverables:

- Wallet scoring job.
- Score explanation.
- Sortable score column.

Acceptance criteria:

- Every watched wallet can have a score.
- Score reasons are visible.
- User can sort wallets by score.

### CR-042: Smart Money Dashboard

Goal:

Show what high-score or manually labeled Smart Money wallets are doing.

Deliverables:

- Top buys.
- Top sells.
- Most accumulated tokens.
- New positions.
- Large exits.
- 24h and 7d filters.

Acceptance criteria:

- User can quickly see recent Smart Money activity.
- Token and wallet rows link to detail pages.
- Empty state explains how to create labels.

## Milestone 5: Alerts And Monitoring

### CR-050: Alert Rules Engine

Goal:

Create local monitoring rules.

Rule types:

- Wallet received token over X USD.
- Wallet sent token over X USD.
- Smart wallet bought token.
- Watched token has inflow spike.
- Portfolio value drops X%.
- New token appears in a Smart Money wallet.

Deliverables:

- Alert rule model.
- Alert evaluation worker.
- Alert events table.
- Rule management UI.

Acceptance criteria:

- User can create, edit, and disable alerts.
- Sync jobs can trigger alert events.
- Alert event history is visible.

### CR-051: Notification Channels

Goal:

Surface alerts to the user.

MVP channels:

- In-app notification center.
- Desktop notification.

Future channels:

- Telegram bot.
- Discord webhook.
- Email.

Acceptance criteria:

- Triggered alerts appear in the UI.
- Notifications can be marked as read.
- User can inspect alert history.

## Milestone 6: AI Analysis Layer

### CR-060: AI Summary Engine

Goal:

Use AI to summarize wallets, tokens, and abnormal flows.

Deliverables:

- Wallet summary.
- Token summary.
- Daily market report.
- Abnormal transfer explanation.
- "What changed since last sync?" report.
- AI report storage.

Acceptance criteria:

- Wallet and token pages can generate insights.
- Reports are stored in the database.
- Prompts never include secrets.
- Reports reference the data used.

### CR-061: Chat With Your Onchain Data

Goal:

Allow the user to query local onchain data through chat.

Example questions:

- What did Smart Money buy recently?
- Which wallets are accumulating ETH?
- Did my watchlist have any large transfers?
- Who is selling this token?

Deliverables:

- Chat UI.
- Local data retrieval layer.
- Tool/function calls over the local database.
- Linked results back to wallets and tokens.

Acceptance criteria:

- Chat answers from local data.
- Answers include related links.
- The app refuses or clearly marks unsupported claims.

## Milestone 7: Research-To-Action Without Trading

### CR-070: Research-To-Action Panel

Goal:

Create a token decision panel without handling private keys or direct trades.

Deliverables:

- Token risk summary.
- Liquidity summary.
- Recent Smart Money activity.
- Top inflows and outflows.
- Price links.
- External DEX links.
- Not-financial-advice notice.

Acceptance criteria:

- Token page includes an action panel.
- User can open external trading or chart tools.
- App does not imply it can execute trades.

### CR-071: Non-Custodial Trading Placeholder

Goal:

Prepare future architecture while keeping trading disabled.

Deliverables:

- Wallet connection abstraction.
- Transaction preview interface.
- Slippage placeholder.
- Route display placeholder.
- Feature flag: `ENABLE_TRADING=false`.

Acceptance criteria:

- Trading is disabled by default.
- No private keys are stored.
- UI clearly marks trading as unavailable in MVP.

## Milestone 8: UI And UX

### CR-080: App Layout

Goal:

Create the complete app navigation shell.

Pages:

- Dashboard.
- Wallets.
- Wallet Profiler.
- Tokens.
- Token Flow.
- Smart Money.
- Alerts.
- AI Reports.
- Settings.

Acceptance criteria:

- Sidebar navigation works.
- Dark mode is supported.
- Desktop-first responsive layout.
- Loading, empty, and error states exist.

### CR-081: Data Visualization

Goal:

Create readable charts for onchain analysis.

Charts:

- Portfolio value line chart.
- Token allocation chart.
- Inflow/outflow bar chart.
- Wallet activity timeline.
- Smart Money accumulation chart.

Acceptance criteria:

- Charts remain readable at common desktop sizes.
- Filters do not break layout.
- Empty data does not show fake charts.

## Milestone 9: DevOps And Quality

### CR-090: Testing

Goal:

Add enough tests to safely evolve the MVP.

Test areas:

- Adapter unit tests.
- Database repository tests.
- Alert engine tests.
- API route tests.
- UI smoke tests.

Acceptance criteria:

- `npm test` runs.
- Mock data is stable.
- Core tests do not need real API keys.

### CR-091: GitHub Actions

Goal:

Run automated checks on push and pull request.

Workflow:

- Install.
- Lint.
- Typecheck.
- Test.
- Build.

Acceptance criteria:

- GitHub Actions workflow exists.
- Pushes and PRs trigger checks.
- README includes a status badge after repo creation.

### CR-092: Local Backup And Export

Goal:

Protect the user's local intelligence data.

Deliverables:

- SQLite backup export.
- Wallet labels CSV export.
- Alert rules JSON export.
- Import backup.
- Restore flow.

Acceptance criteria:

- User can export a backup.
- A fresh environment can restore the backup.
- Secrets are excluded from export.

## MVP Scope

The fastest usable MVP should include:

- CR-001: GitHub Repo Automation.
- CR-002: Project Scaffold.
- CR-010: Prisma Schema And Database Design.
- CR-011: Wallet Watchlist.
- CR-012: Wallet Profiler MVP.
- CR-020: Chain Adapter Interface.
- CR-021: Ethereum Or Base Data Sync.
- CR-022: Price Data Adapter.
- CR-030: Portfolio Dashboard.
- CR-040: Local Wallet Label Database.

This MVP produces a local app that can:

- Create and sync its GitHub repository.
- Run locally.
- Track watched wallets.
- Fetch balances and transactions.
- Display a portfolio dashboard.
- Store user-defined wallet labels.
- Provide the foundation for Smart Money analysis.

## Recommended Agentic AI Execution Order

1. Complete Milestone 0 to create the repo and app foundation.
2. Complete Milestone 1 to establish data models and wallet tracking.
3. Complete Milestone 2 to connect the first real chain and price data.
4. Complete Milestone 3 to make analysis useful.
5. Complete Milestone 4 to add the user's own Smart Money system.
6. Complete Milestone 5 and Milestone 6 for alerts and AI reports.
7. Complete Milestone 8 and Milestone 9 to improve usability, testing, CI, and backup.

## Environment Variables

Suggested `.env.example`:

```env
DATABASE_URL="file:./dev.db"

GITHUB_TOKEN=""
GITHUB_OWNER=""
GITHUB_REPO_NAME="chain-reaction"
GITHUB_REPO_PRIVATE="true"

ALCHEMY_API_KEY=""
ETHERSCAN_API_KEY=""
COVALENT_API_KEY=""
MORALIS_API_KEY=""

COINGECKO_API_KEY=""

OPENAI_API_KEY=""
LOCAL_LLM_BASE_URL=""

ENABLE_TRADING="false"
```

## Security Notes

- Do not store private keys.
- Do not commit `.env`.
- Do not export API keys in backups.
- Trading must remain disabled in MVP.
- Any future trading feature must use non-custodial wallet connection and explicit user confirmation.
- AI reports must not be treated as financial advice.

## Definition Of Done

The initial project is considered done when:

- A new GitHub repository named `chain-reaction` can be created automatically.
- The local web app runs from a clean install.
- A user can add wallets to a watchlist.
- The app can sync at least one chain.
- Token balances and recent transfers are stored locally.
- Portfolio dashboard displays real synced data.
- User-defined labels appear throughout the app.
- The project includes tests, GitHub Actions, and backup/export.
- README setup instructions are accurate.

## Future Extensions

- Solana support.
- Hyperliquid data support.
- NFT portfolio support.
- Telegram and Discord alerts.
- Realized PnL engine.
- Tax export.
- Multi-user mode.
- Local vector search over chain history.
- Full local LLM support.
- Optional non-custodial trading integration after MVP.

