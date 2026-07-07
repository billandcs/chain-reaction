import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  DatabaseZap,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import {
  TokenFlowBarChart,
  TokenPriceLineChart,
} from "@/components/token-detail-charts";
import {
  AddressText,
  MetricTile,
  PageHeader,
  Panel,
  StatusPill,
} from "@/components/ui";
import { formatDateTimeUtc, formatMonthDayUtc } from "@/lib/format";
import { getToken } from "@/lib/repositories";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const tokenAmount = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

type Props = {
  params: Promise<{ id: string }>;
};

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export default async function TokenDetailPage({ params }: Props) {
  const { id } = await params;
  const token = await getToken(id);

  if (!token) {
    notFound();
  }

  const exposure = token.balances.reduce(
    (sum, balance) => sum + (balance.usdValue ?? 0),
    0,
  );
  const latestPrice = token.prices.at(-1);
  const inflows = token.transfers.filter((transfer) => transfer.toWalletId);
  const outflows = token.transfers.filter((transfer) => transfer.fromWalletId);
  const inflowUsd = inflows.reduce(
    (sum, transfer) => sum + (transfer.usdValue ?? 0),
    0,
  );
  const outflowUsd = outflows.reduce(
    (sum, transfer) => sum + (transfer.usdValue ?? 0),
    0,
  );
  const netFlow = inflowUsd - outflowUsd;
  const flowBuckets = Array.from(
    token.transfers.reduce((map, transfer) => {
      const label = formatMonthDayUtc(transfer.timestamp);
      const bucket = map.get(label) ?? { label, inflow: 0, outflow: 0 };
      if (transfer.toWalletId) bucket.inflow += transfer.usdValue ?? 0;
      if (transfer.fromWalletId) bucket.outflow += transfer.usdValue ?? 0;
      map.set(label, bucket);
      return map;
    }, new Map<string, { label: string; inflow: number; outflow: number }>()),
  ).map(([, value]) => value);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${token.symbol} Token Flow`}
        description={`${token.name} exposure, watched-wallet holders, local transfers, and research guardrails. This page is read-only and never executes trades.`}
        action={
          <Link
            href="/tokens"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2b3a50] bg-white/[0.05] px-4 text-sm font-medium text-[#dbeafe]"
          >
            All Tokens
          </Link>
        }
      />

      <section className="glass-panel rounded-lg p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusPill tone="info">{token.chain}</StatusPill>
              <StatusPill tone={token.coingeckoId ? "good" : "neutral"}>
                {token.coingeckoId ?? "No CoinGecko id"}
              </StatusPill>
              <StatusPill tone="warn">Research only</StatusPill>
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
              Contract
            </div>
            <div className="mt-2 max-w-full truncate rounded-lg border border-[#2b3a50] bg-white/[0.05] px-3 py-2">
              <AddressText address={token.address} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[520px]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                Latest Price
              </div>
              <div className="mt-1 text-3xl font-semibold">
                {latestPrice ? money.format(latestPrice.priceUsd) : "None"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                Exposure
              </div>
              <div className="mt-1 text-3xl font-semibold">
                {money.format(exposure)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                Net Flow
              </div>
              <div
                className={
                  netFlow >= 0
                    ? "mt-1 text-3xl font-semibold text-[#38bdf8]"
                    : "mt-1 text-3xl font-semibold text-[#fb7185]"
                }
              >
                {money.format(netFlow)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Watched Holders"
          value={String(token.balances.length)}
          detail="Wallets with local balance"
          icon={WalletCards}
          tone="blue"
        />
        <MetricTile
          label="Recent Inflow"
          value={money.format(inflowUsd)}
          detail={`${inflows.length} incoming rows`}
          icon={ArrowDownLeft}
        />
        <MetricTile
          label="Recent Outflow"
          value={money.format(outflowUsd)}
          detail={`${outflows.length} outgoing rows`}
          icon={ArrowUpRight}
          tone="rose"
        />
        <MetricTile
          label="Price Snapshots"
          value={String(token.prices.length)}
          detail={latestPrice ? latestPrice.source : "No source"}
          icon={DatabaseZap}
          tone="amber"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Local Price Trend" eyebrow="Price snapshots">
          <TokenPriceLineChart
            data={token.prices.map((price) => ({
              timestamp: price.capturedAt,
              price: price.priceUsd,
            }))}
          />
        </Panel>
        <Panel title="Watched Flow" eyebrow="Inflow / outflow">
          <TokenFlowBarChart data={flowBuckets} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel
          title="Watched Holders"
          eyebrow={`${token.balances.length} wallets`}
        >
          <div className="divide-y divide-[#d8e0ec]/70 dark:divide-[#223047]/80">
            {token.balances.length === 0 ? (
              <div className="py-8 text-sm text-[#98a4b3]">
                No watched wallet holds this token yet.
              </div>
            ) : (
              token.balances.map((balance) => (
                <Link
                  key={balance.id}
                  href={`/wallets/${balance.wallet.id}`}
                  className="flex items-center justify-between gap-4 py-3 hover:text-[#7dd3fc]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {balance.wallet.name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusPill
                        tone={
                          balance.wallet.labels[0]?.type === "Smart Money"
                            ? "good"
                            : "neutral"
                        }
                      >
                        {balance.wallet.labels[0]?.type ?? "Unlabeled"}
                      </StatusPill>
                      <span className="text-xs text-[#98a4b3]">
                        {balance.wallet.chain}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {money.format(balance.usdValue ?? 0)}
                    </div>
                    <div className="text-xs text-[#98a4b3]">
                      {tokenAmount.format(balance.amount)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Recent Token Flows"
          eyebrow={`${token.transfers.length} rows`}
        >
          <div className="divide-y divide-[#d8e0ec]/70 dark:divide-[#223047]/80">
            {token.transfers.length === 0 ? (
              <div className="py-8 text-sm text-[#98a4b3]">
                No transfers synced for this token.
              </div>
            ) : (
              token.transfers.map((transfer) => {
                const incoming = Boolean(transfer.toWalletId);
                const wallet = transfer.toWallet ?? transfer.fromWallet;
                return (
                  <div
                    key={transfer.id}
                    className="grid gap-3 py-3 sm:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={incoming ? "good" : "risk"}>
                          {incoming ? "Inflow" : "Outflow"}
                        </StatusPill>
                        <span className="font-medium">
                          {wallet?.name ?? "External wallet"}
                        </span>
                      </div>
                      <div className="mt-2 truncate font-mono text-xs text-[#98a4b3]">
                        {shortHash(transfer.hash)}
                      </div>
                      <div className="mt-1 text-xs text-[#98a4b3]">
                        {formatDateTimeUtc(transfer.timestamp)}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-medium">
                        {money.format(transfer.usdValue ?? 0)}
                      </div>
                      <div className="text-xs text-[#98a4b3]">
                        {tokenAmount.format(transfer.amount)} {token.symbol}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Research Guardrail" eyebrow="MVP safety">
        <div className="flex flex-col gap-3 text-sm leading-6 text-[#98a4b3] sm:flex-row sm:items-start">
          <ShieldAlert className="mt-0.5 shrink-0 text-[#f59e0b]" size={18} />
          <p>
            This page helps inspect local wallet exposure and observed flows. It
            does not hold private keys, send orders, or imply that local demo
            data is a complete market view.
          </p>
        </div>
      </Panel>
    </div>
  );
}
