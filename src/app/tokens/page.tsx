import Link from "next/link";
import { ArrowDownLeft, Coins, WalletCards } from "lucide-react";
import { TokenForm } from "@/components/token-form";
import { listTokens } from "@/lib/repositories";
import {
  AddressText,
  MetricTile,
  PageHeader,
  Panel,
  StatusPill,
} from "@/components/ui";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const dynamic = "force-dynamic";

export default async function TokensPage() {
  const tokens = await listTokens();
  const totalExposure = tokens.reduce(
    (sum, token) =>
      sum +
      token.balances.reduce(
        (tokenSum, balance) => tokenSum + (balance.usdValue ?? 0),
        0,
      ),
    0,
  );
  const flowCount = tokens.reduce(
    (sum, token) => sum + token.transfers.length,
    0,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tokens"
        description="Exposure, watched-wallet holders, latest local prices, and token transfer activity across synced wallets."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile
          label="Token Exposure"
          value={money.format(totalExposure)}
          detail="Across watched wallets"
          icon={Coins}
        />
        <MetricTile
          label="Synced Tokens"
          value={String(tokens.length)}
          detail="With metadata"
          icon={WalletCards}
          tone="blue"
        />
        <MetricTile
          label="Recent Flows"
          value={String(flowCount)}
          detail="Latest transfer rows"
          icon={ArrowDownLeft}
          tone="amber"
        />
      </div>

      <Panel title="Add Token" eyebrow="Create from address">
        <TokenForm />
      </Panel>

      <Panel
        title="Token Exposure"
        eyebrow={`${tokens.length} assets`}
        className="overflow-hidden"
      >
        {tokens.length === 0 ? (
          <div className="py-10 text-sm text-[#64706b] dark:text-[#9aa39e]">
            No tokens synced yet.
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="glass-divider grid grid-cols-[1.4fr_0.75fr_0.65fr_0.75fr] gap-4 border-b pb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                <div>Token</div>
                <div>Exposure</div>
                <div>Wallets</div>
                <div>Latest Price</div>
              </div>
              <div className="divide-y divide-[#d8e0ec]/70 dark:divide-[#223047]/80">
                {tokens.map((token) => {
                  const exposure = token.balances.reduce(
                    (sum, balance) => sum + (balance.usdValue ?? 0),
                    0,
                  );
                  const price = token.prices[0]?.priceUsd;
                  return (
                    <Link
                      key={token.id}
                      href={`/tokens/${token.id}`}
                      className="grid grid-cols-[1.4fr_0.75fr_0.65fr_0.75fr] gap-4 py-4 transition hover:text-[#7dd3fc]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{token.symbol}</span>
                          <StatusPill tone="info">{token.chain}</StatusPill>
                        </div>
                        <div className="mt-1 truncate">
                          <AddressText address={token.address} />
                        </div>
                      </div>
                      <div className="font-medium">
                        {money.format(exposure)}
                      </div>
                      <div>{token.balances.length}</div>
                      <div>{price ? money.format(price) : "None"}</div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {tokens.map((token) => {
                const exposure = token.balances.reduce(
                  (sum, balance) => sum + (balance.usdValue ?? 0),
                  0,
                );
                const price = token.prices[0]?.priceUsd;
                return (
                  <Link
                    key={token.id}
                    href={`/tokens/${token.id}`}
                    className="glass-subpanel block rounded-lg p-4 transition hover:text-[#7dd3fc]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="mt-1">
                          <AddressText address={token.address} />
                        </div>
                      </div>
                      <div className="text-right font-medium">
                        {money.format(exposure)}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusPill tone="info">{token.chain}</StatusPill>
                      <StatusPill>{token.balances.length} wallets</StatusPill>
                      <StatusPill tone={price ? "good" : "neutral"}>
                        {price ? money.format(price) : "No price"}
                      </StatusPill>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </Panel>

      <Panel title="Latest Token Flows" eyebrow="Transfer rows">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tokens.flatMap((token) =>
            token.transfers.map((transfer) => ({ token, transfer })),
          ).length === 0 ? (
            <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">
              No transfer rows synced.
            </div>
          ) : (
            tokens
              .flatMap((token) =>
                token.transfers.map((transfer) => ({ token, transfer })),
              )
              .slice(0, 9)
              .map(({ token, transfer }) => (
                <div
                  key={transfer.id}
                  className="glass-subpanel rounded-lg p-3"
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="font-medium">
                      {money.format(transfer.usdValue ?? 0)}
                    </span>
                  </div>
                  <div className="mt-2 truncate font-mono text-xs text-[#65716b] dark:text-[#89958f]">
                    {transfer.fromAddress.slice(0, 10)}... to{" "}
                    {transfer.toAddress.slice(0, 10)}...
                  </div>
                </div>
              ))
          )}
        </div>
      </Panel>
    </div>
  );
}
