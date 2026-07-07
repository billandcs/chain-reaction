import Link from "next/link";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Gauge,
  Radar,
  ShieldAlert,
  Tags,
  WalletCards,
} from "lucide-react";
import { PortfolioLineChart, TokenBarChart } from "@/components/portfolio-chart";
import { getDashboardData } from "@/lib/repositories";
import { MetricTile, StatusPill } from "@/components/ui";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const inflows = data.transfers.filter((transfer) =>
    data.wallets.some((wallet) => wallet.address === transfer.toAddress),
  );
  const outflows = data.transfers.filter((transfer) =>
    data.wallets.some((wallet) => wallet.address === transfer.fromAddress),
  );
  const inflowUsd = inflows.reduce((sum, transfer) => sum + (transfer.usdValue ?? 0), 0);
  const outflowUsd = outflows.reduce((sum, transfer) => sum + (transfer.usdValue ?? 0), 0);
  const latestSync = data.wallets
    .flatMap((wallet) => wallet.balances.map((balance) => balance.syncedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const netFlow = inflowUsd - outflowUsd;

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
        <div className="flex flex-col gap-3 border-b border-[#d8e0ec] px-4 py-3 dark:border-[#1d2838] xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Gauge size={20} className="text-[#38bdf8]" />
              Intelligence Desk
            </div>
            <nav className="flex flex-wrap gap-1 text-sm">
              {["Portfolio", "Flows", "Smart Money", "Risk"].map((tab, index) => (
                <span
                  key={tab}
                  className={
                    index === 0
                      ? "rounded-md border-b-2 border-[#38bdf8] px-3 py-2 font-medium text-[#2563eb] dark:text-[#7dd3fc]"
                      : "px-3 py-2 text-[#626b7a] dark:text-[#98a4b3]"
                  }
                >
                  {tab}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="info">SQLite local</StatusPill>
            <StatusPill tone="warn">Trading disabled</StatusPill>
            <Link
              href="/wallets"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2563eb] px-3 text-sm font-medium text-white hover:bg-[#1d4ed8]"
            >
              Add Wallet
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-[#d8e0ec] dark:border-[#1d2838] md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Portfolio", money.format(data.totalValue), "Local marked value"],
            ["Net Flow", money.format(netFlow), `${inflows.length} in / ${outflows.length} out`],
            ["Wallets", String(data.trackedWallets), `${data.activeWallets} active`],
            ["Smart Labels", String(data.smartWallets), "User-owned tags"],
            ["Alerts", String(data.alerts.filter((alert) => !alert.readAt).length), "Unread events"],
            ["Latest Sync", latestSync ? latestSync.toLocaleTimeString() : "None", latestSync ? latestSync.toLocaleDateString() : "No data"],
          ].map(([label, value, detail]) => (
            <div key={label} className="border-b border-r border-[#d8e0ec] px-4 py-3 dark:border-[#1d2838] xl:border-b-0">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                {label}
              </div>
              <div className="mt-1 text-xl font-semibold text-[#10131a] dark:text-[#f3f7fb]">{value}</div>
              <div className="mt-1 text-xs text-[#626b7a] dark:text-[#98a4b3]">{detail}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.72fr)_minmax(300px,0.62fr)]">
        <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e0ec] px-4 py-3 dark:border-[#1d2838]">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                Portfolio chart
              </div>
              <h2 className="mt-1 text-base font-semibold">Local Value Trend</h2>
            </div>
            <div className="flex gap-1 text-sm">
              {["1d", "7d", "30d", "All"].map((range, index) => (
                <span
                  key={range}
                  className={
                    index === 3
                      ? "rounded-md bg-[#e7efff] px-2 py-1 font-medium text-[#2563eb] dark:bg-[#10213a] dark:text-[#7dd3fc]"
                      : "px-2 py-1 text-[#626b7a] dark:text-[#98a4b3]"
                  }
                >
                  {range}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3">
            <PortfolioLineChart data={data.snapshots.map((point) => ({ capturedAt: point.capturedAt, totalValueUsd: point.totalValueUsd }))} />
          </div>
        </section>

        <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
          <div className="grid grid-cols-2 border-b border-[#d8e0ec] dark:border-[#1d2838]">
            <div className="border-b-2 border-[#38bdf8] px-4 py-3 font-semibold text-[#2563eb] dark:text-[#7dd3fc]">
              Flow Book
            </div>
            <div className="px-4 py-3 font-semibold text-[#626b7a] dark:text-[#98a4b3]">Transfers</div>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2 grid grid-cols-[1fr_auto] text-xs uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
              <span>Token</span>
              <span>Value</span>
            </div>
            <div className="space-y-1">
              {data.transfers.slice(0, 12).map((transfer) => {
                const incoming = data.wallets.some((wallet) => wallet.address === transfer.toAddress);
                return (
                  <div
                    key={transfer.id}
                    className="grid grid-cols-[1fr_auto] rounded-md bg-[#f2f5fa] px-2 py-1.5 text-sm dark:bg-[#101824]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={incoming ? "text-[#38bdf8]" : "text-[#fb7185]"}>
                        {incoming ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                      </span>
                      <span className="font-medium">{transfer.token.symbol}</span>
                      <span className="truncate font-mono text-xs text-[#748096] dark:text-[#8795a8]">
                        {transfer.hash.slice(0, 8)}...
                      </span>
                    </div>
                    <span className={incoming ? "font-mono text-[#0284c7] dark:text-[#7dd3fc]" : "font-mono text-[#e11d48] dark:text-[#fb7185]"}>
                      {money.format(transfer.usdValue ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
          <div className="grid grid-cols-2 border-b border-[#d8e0ec] dark:border-[#1d2838]">
            <div className="px-4 py-3 font-semibold text-[#626b7a] dark:text-[#98a4b3]">Token</div>
            <div className="border-b-2 border-[#38bdf8] px-4 py-3 font-semibold text-[#2563eb] dark:text-[#7dd3fc]">
              Research
            </div>
          </div>
          <div className="space-y-4 p-4">
            <MetricTile label="Recent Inflow" value={money.format(inflowUsd)} detail={`${inflows.length} incoming transfers`} icon={ArrowDownLeft} />
            <MetricTile label="Recent Outflow" value={money.format(outflowUsd)} detail={`${outflows.length} outgoing transfers`} icon={ArrowUpRight} tone="rose" />
            <div className="rounded-lg border border-[#dde4ef] bg-[#f8faff] p-3 dark:border-[#253246] dark:bg-[#101824]">
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <ShieldAlert size={17} className="text-[#f59e0b]" />
                Research Guardrail
              </div>
              <p className="text-sm leading-6 text-[#626b7a] dark:text-[#98a4b3]">
                This panel links to external tools later, but the MVP never executes trades or stores private keys.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
          <div className="flex items-center justify-between border-b border-[#d8e0ec] px-4 py-3 dark:border-[#1d2838]">
            <div className="flex items-center gap-2 font-semibold">
              <Radar size={17} className="text-[#38bdf8]" />
              Watchlist Activity
            </div>
            <StatusPill tone="info">{data.transfers.length} rows</StatusPill>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <MetricTile label="Unread Alerts" value={String(data.alerts.filter((alert) => !alert.readAt).length)} detail="Local notification center" icon={Bell} tone="rose" />
            <MetricTile label="Wallet Activity" value={String(data.transfers.length)} detail="Recent synced flows" icon={Activity} tone="blue" />
            <MetricTile label="Top Tokens" value={String(data.topTokens.length)} detail="With local balances" icon={Tags} tone="amber" />
          </div>
        </section>

        <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
          <div className="flex items-center justify-between border-b border-[#d8e0ec] px-4 py-3 dark:border-[#1d2838]">
            <div className="flex items-center gap-2 font-semibold">
              <WalletCards size={17} className="text-[#818cf8]" />
              Watchlist
            </div>
            <Link href="/wallets" className="text-sm font-medium text-[#2563eb] dark:text-[#7dd3fc]">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-[#e2e7f0] px-4 dark:divide-[#223047]">
            {data.wallets.slice(0, 6).map((wallet) => {
              const value = wallet.balances.reduce((sum, balance) => sum + (balance.usdValue ?? 0), 0);
              const label = wallet.labels[0]?.type ?? "Unlabeled";
              return (
                <Link key={wallet.id} href={`/wallets/${wallet.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-[#2563eb] dark:hover:text-[#7dd3fc]">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{wallet.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusPill tone={label === "Smart Money" ? "good" : "neutral"}>{label}</StatusPill>
                      <span className="text-xs text-[#626b7a] dark:text-[#98a4b3]">{wallet.chain}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{money.format(value)}</div>
                    <div className="text-xs text-[#626b7a] dark:text-[#98a4b3]">{wallet.trackingEnabled ? "Tracking" : "Paused"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
        <div className="border-b border-[#d8e0ec] px-4 py-3 font-semibold dark:border-[#1d2838]">Top Holdings</div>
        <div className="p-3">
          <TokenBarChart data={data.topTokens} />
        </div>
      </section>
    </div>
  );
}
