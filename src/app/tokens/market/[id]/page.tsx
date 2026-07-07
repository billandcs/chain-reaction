import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Database,
  ShieldAlert,
} from "lucide-react";
import { TokenPriceLineChart } from "@/components/token-detail-charts";
import { MetricTile, PageHeader, Panel, StatusPill } from "@/components/ui";
import { getPriorityMarketHistory } from "@/lib/market-history";
import { formatDateTimeUtc } from "@/lib/format";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

type Props = {
  params: Promise<{ id: string }>;
};

function ChangePill({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={
        positive
          ? "inline-flex items-center gap-1 font-mono text-[#38bdf8]"
          : "inline-flex items-center gap-1 font-mono text-[#fb7185]"
      }
    >
      <Icon size={14} />
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export default async function MarketTokenPage({ params }: Props) {
  const { id } = await params;
  const rows = await getPriorityMarketHistory();
  const row = rows.find((item) => item.id === id);

  if (!row) {
    notFound();
  }

  const rangeLow = Math.min(...row.points.map((point) => point.price));
  const rangeHigh = Math.max(...row.points.map((point) => point.price));
  const positiveBias = row.change24h >= 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${row.symbol} Market Detail`}
        description={`${row.name} market history from the homepage screener. This is external market data, separate from your local watched-wallet flow records.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2b3a50] bg-white/[0.05] px-4 text-sm font-medium text-[#dbeafe]"
            >
              Dashboard
            </Link>
            <Link
              href="/tokens"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white"
            >
              Local Tokens
            </Link>
          </div>
        }
      />

      <section className="glass-panel rounded-lg p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="flex min-w-0 items-start gap-4">
            <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/10">
              {row.image ? (
                <Image
                  src={row.image}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                row.symbol.slice(0, 2)
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-semibold">{row.symbol}</h2>
                <StatusPill tone="info">Rank #{row.rank}</StatusPill>
                <StatusPill tone={row.source === "coingecko" ? "good" : "warn"}>
                  {row.source === "coingecko" ? "CoinGecko live" : "Fallback"}
                </StatusPill>
              </div>
              <div className="mt-1 text-sm text-[#98a4b3]">{row.name}</div>
              <div className="mt-3 text-xs text-[#98a4b3]">
                Updated {formatDateTimeUtc(row.updatedAt)}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[520px]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                Price
              </div>
              <div className="mt-1 text-3xl font-semibold">
                {money.format(row.currentPrice)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                24h
              </div>
              <div className="mt-1 text-2xl font-semibold">
                <ChangePill value={row.change24h} />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                30d Bias
              </div>
              <div
                className={
                  positiveBias
                    ? "mt-1 text-2xl font-semibold text-[#38bdf8]"
                    : "mt-1 text-2xl font-semibold text-[#fb7185]"
                }
              >
                {positiveBias ? "Constructive" : "Defensive"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="24h Volume"
          value={compactUsd.format(row.volume24h)}
          detail="Volume-ranked table"
          icon={Activity}
        />
        <MetricTile
          label="Market Cap"
          value={compactUsd.format(row.marketCap)}
          detail={
            row.marketCapRank
              ? `MCap rank #${row.marketCapRank}`
              : "Rank unavailable"
          }
          icon={BarChart3}
          tone="blue"
        />
        <MetricTile
          label="7d Change"
          value={`${row.change7d >= 0 ? "+" : ""}${row.change7d.toFixed(2)}%`}
          detail="CoinGecko window"
          icon={ArrowUpRight}
          tone={row.change7d >= 0 ? "teal" : "rose"}
        />
        <MetricTile
          label="30d Range"
          value={`${money.format(rangeLow)} - ${money.format(rangeHigh)}`}
          detail="Sparkline min / max"
          icon={Database}
          tone="amber"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Market Price History" eyebrow="CoinGecko sparkline">
          <TokenPriceLineChart
            data={row.points.map((point) => ({
              timestamp: point.timestamp,
              price: point.price,
            }))}
            emptyLabel="No market sparkline available"
          />
        </Panel>

        <Panel title="Research Notes" eyebrow="Market context">
          <div className="space-y-4 text-sm leading-6 text-[#98a4b3]">
            <div className="rounded-lg border border-[#2b3a50] bg-white/[0.04] p-3">
              <div className="mb-2 font-semibold text-[#f8fafc]">
                Screening Signal
              </div>
              <p>
                {row.symbol} is ranked by 24h volume in the homepage screener.
                Use this page to inspect price movement before comparing it with
                local wallet exposure.
              </p>
            </div>
            <div className="rounded-lg border border-[#2b3a50] bg-white/[0.04] p-3">
              <div className="mb-2 font-semibold text-[#f8fafc]">
                Next Useful Step
              </div>
              <p>
                Add or sync watched wallets that hold {row.symbol}, then inspect
                local token flows from the Local Tokens page.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Safety Guardrail" eyebrow="External market data">
        <div className="flex flex-col gap-3 text-sm leading-6 text-[#98a4b3] sm:flex-row sm:items-start">
          <ShieldAlert className="mt-0.5 shrink-0 text-[#f59e0b]" size={18} />
          <p>
            This page is read-only market research. It does not execute trades,
            store keys, or claim that external market data reflects your local
            wallet watchlist.
          </p>
        </div>
      </Panel>
    </div>
  );
}
