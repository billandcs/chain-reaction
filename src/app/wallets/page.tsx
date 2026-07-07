import Link from "next/link";
import { Wallet, WalletCards } from "lucide-react";
import { WalletForm } from "@/components/wallet-form";
import { listWallets } from "@/lib/repositories";
import { AddressText, PageHeader, Panel, StatusPill } from "@/components/ui";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const dynamic = "force-dynamic";

export default async function WalletsPage() {
  const wallets = await listWallets();
  const activeWallets = wallets.filter((wallet) => wallet.trackingEnabled).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Wallets"
        description="Build your local watchlist, attach personal labels, and sync balances without relying on proprietary wallet datasets."
        action={<StatusPill tone="info">{activeWallets} active</StatusPill>}
      />

      <Panel title="Add Wallet" eyebrow="Watchlist intake" action={<WalletCards size={17} className="text-[#748079] dark:text-[#87938c]" />}>
        <WalletForm />
      </Panel>

      <Panel title="Tracked Wallets" eyebrow={`${wallets.length} total`} className="overflow-hidden">
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-[#edf2ef] text-[#53605a] dark:bg-[#1c2420] dark:text-[#a4ada7]">
              <Wallet size={20} />
            </div>
            <div className="font-medium">No wallets yet</div>
            <div className="mt-1 max-w-sm text-sm text-[#64706b] dark:text-[#9aa39e]">
              Add an EVM address above, then run a manual sync from the profile page.
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="grid grid-cols-[1.45fr_0.9fr_0.7fr_0.65fr] gap-4 border-b border-[#e2e6e1] px-1 pb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#748079] dark:border-[#25302b] dark:text-[#87938c]">
                <div>Wallet</div>
                <div>Labels</div>
                <div>Value</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
                {wallets.map((wallet) => {
                  const value = wallet.balances.reduce((sum, balance) => sum + (balance.usdValue ?? 0), 0);
                  return (
                    <Link
                      key={wallet.id}
                      href={`/wallets/${wallet.id}`}
                      className="grid grid-cols-[1.45fr_0.9fr_0.7fr_0.65fr] gap-4 px-1 py-4 transition hover:text-[#2563eb] dark:hover:text-[#7dd3fc]"
                    >
                      <div className="min-w-0">
                        <div className="font-medium">{wallet.name}</div>
                        <div className="mt-1 truncate">
                          <AddressText address={wallet.address} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {wallet.labels.length === 0 ? (
                          <StatusPill>Unlabeled</StatusPill>
                        ) : (
                          wallet.labels.map((label) => (
                            <StatusPill key={label.id} tone={label.type === "Smart Money" ? "good" : label.type === "Whale" ? "warn" : "neutral"}>
                              {label.type}
                            </StatusPill>
                          ))
                        )}
                      </div>
                      <div className="font-medium">{money.format(value)}</div>
                      <div>
                        <StatusPill tone={wallet.trackingEnabled ? "good" : "neutral"}>
                          {wallet.trackingEnabled ? "Tracking" : "Paused"}
                        </StatusPill>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {wallets.map((wallet) => {
                const value = wallet.balances.reduce((sum, balance) => sum + (balance.usdValue ?? 0), 0);
                const label = wallet.labels[0]?.type ?? "Unlabeled";
                return (
                  <Link
                    key={wallet.id}
                    href={`/wallets/${wallet.id}`}
                    className="block rounded-lg border border-[#dce1db] bg-white p-4 dark:border-[#27312d] dark:bg-[#111614]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{wallet.name}</div>
                        <div className="mt-1">
                          <AddressText address={wallet.address} />
                        </div>
                      </div>
                      <div className="text-right font-medium">{money.format(value)}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusPill tone={label === "Smart Money" ? "good" : label === "Whale" ? "warn" : "neutral"}>
                        {label}
                      </StatusPill>
                      <StatusPill tone="info">{wallet.chain}</StatusPill>
                      <StatusPill tone={wallet.trackingEnabled ? "good" : "neutral"}>
                        {wallet.trackingEnabled ? "Tracking" : "Paused"}
                      </StatusPill>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
