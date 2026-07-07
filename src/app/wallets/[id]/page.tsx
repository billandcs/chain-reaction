import { notFound } from "next/navigation";
import { Activity, Clock3, Coins, DatabaseZap } from "lucide-react";
import { DeleteWalletButton, SyncButton } from "@/components/sync-button";
import { AddressText, MetricTile, PageHeader, Panel, StatusPill } from "@/components/ui";
import { formatDateTimeUtc, formatDateUtc, formatTimeUtc } from "@/lib/format";
import { getWallet } from "@/lib/repositories";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const tokenAmount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WalletProfilePage({ params }: Props) {
  const { id } = await params;
  const wallet = await getWallet(id);

  if (!wallet) {
    notFound();
  }

  const totalValue = wallet.balances.reduce((sum, balance) => sum + (balance.usdValue ?? 0), 0);
  const latestActivity = wallet.transactions[0]?.timestamp ?? wallet.incoming[0]?.timestamp ?? wallet.outgoing[0]?.timestamp;
  const firstActivity = [...wallet.transactions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0]?.timestamp;
  const topToken = wallet.balances[0]?.token.symbol ?? "None";

  return (
    <div className="space-y-5">
      <PageHeader
        title={wallet.name}
        description={`Wallet profile for ${wallet.chain}. Balances, transactions, transfer direction, and sync jobs are stored locally.`}
        action={
          <div className="flex flex-wrap gap-2">
            <SyncButton walletId={wallet.id} />
            <DeleteWalletButton walletId={wallet.id} />
          </div>
        }
      />

      <section className="rounded-lg border border-[#cbd8d3] bg-[#fbfcfa] p-4 shadow-sm dark:border-[#263832] dark:bg-[#141917] sm:p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              {wallet.labels.length === 0 ? (
                <StatusPill>Unlabeled</StatusPill>
              ) : (
                wallet.labels.map((label) => (
                  <StatusPill key={label.id} tone={label.type === "Smart Money" ? "good" : label.type === "Whale" ? "warn" : "neutral"}>
                    {label.type} {label.confidence}%
                  </StatusPill>
                ))
              )}
              <StatusPill tone={wallet.trackingEnabled ? "good" : "neutral"}>
                {wallet.trackingEnabled ? "Tracking" : "Paused"}
              </StatusPill>
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748079] dark:text-[#87938c]">Address</div>
            <div className="mt-2 max-w-full truncate rounded-lg border border-[#dce1db] bg-white px-3 py-2 dark:border-[#27312d] dark:bg-[#111614]">
              <AddressText address={wallet.address} />
            </div>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#748079] dark:text-[#87938c]">Local value</div>
            <div className="mt-1 text-4xl font-semibold">{money.format(totalValue)}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Transactions" value={String(wallet.transactions.length)} detail="Recent local rows" icon={Activity} tone="blue" />
        <MetricTile label="Top Token" value={topToken} detail={`${wallet.balances.length} balances`} icon={Coins} />
        <MetricTile label="First Activity" value={formatDateUtc(firstActivity)} detail="Observed locally" icon={Clock3} tone="amber" />
        <MetricTile label="Latest Activity" value={formatDateUtc(latestActivity)} detail={latestActivity ? `${formatTimeUtc(latestActivity)} UTC` : "No activity"} icon={DatabaseZap} tone="teal" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Token Balances" eyebrow="Holdings">
          <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
            {wallet.balances.length === 0 ? (
              <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">No balances synced.</div>
            ) : (
              wallet.balances.map((balance) => (
                <div key={balance.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="font-medium">{balance.token.symbol}</div>
                    <div className="truncate text-sm text-[#64706b] dark:text-[#9aa39e]">{balance.token.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{money.format(balance.usdValue ?? 0)}</div>
                    <div className="text-xs text-[#64706b] dark:text-[#9aa39e]">{tokenAmount.format(balance.amount)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Recent Transactions" eyebrow="Activity">
          <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
            {wallet.transactions.length === 0 ? (
              <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">No transactions synced.</div>
            ) : (
              wallet.transactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-[1fr_auto] gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs text-[#3f4a45] dark:text-[#c1cac4]">{transaction.hash}</div>
                    <div className="mt-1 text-sm text-[#64706b] dark:text-[#9aa39e]">{formatDateTimeUtc(transaction.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{transaction.valueNative} ETH</div>
                    <StatusPill tone={transaction.status === "success" ? "good" : "warn"}>{transaction.status}</StatusPill>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Sync Jobs" eyebrow="Worker history">
        <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
          {wallet.syncJobs.length === 0 ? (
            <div className="py-6 text-sm text-[#64706b] dark:text-[#9aa39e]">No sync jobs yet.</div>
          ) : (
            wallet.syncJobs.map((job) => (
              <div key={job.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={job.status === "success" ? "good" : job.status === "failed" ? "risk" : "info"}>
                      {job.status}
                    </StatusPill>
                    <span className="text-sm text-[#64706b] dark:text-[#9aa39e]">{job.adapter}</span>
                  </div>
                  <div className="mt-1 text-sm text-[#64706b] dark:text-[#9aa39e]">{job.message ?? "No message"}</div>
                </div>
                <div className="shrink-0 text-sm text-[#64706b] dark:text-[#9aa39e]">{formatDateTimeUtc(job.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
