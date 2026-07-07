import Link from "next/link";
import { Brain, Tags, WalletCards } from "lucide-react";
import { LabelManager } from "@/components/label-manager";
import { listLabels, listWallets } from "@/lib/repositories";
import { MetricTile, PageHeader, Panel, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SmartMoneyPage() {
  const [labels, wallets] = await Promise.all([listLabels(), listWallets()]);
  const smartWallets = wallets
    .map((wallet) => {
      const labelScore = wallet.labels.reduce((sum, label) => sum + label.confidence, 0);
      const flowScore = Math.min(100, wallet._count.incoming * 8 + wallet._count.outgoing * 8);
      const balanceScore = Math.min(100, wallet.balances.length * 12);
      return { wallet, score: Math.round((labelScore + flowScore + balanceScore + wallet.manualScore) / 3) };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Smart Money"
        description="A personal label database and transparent local scoring layer. No proprietary wallet labels are required."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile label="Scored Wallets" value={String(smartWallets.length)} detail="Local score model" icon={Brain} tone="blue" />
        <MetricTile label="Labels" value={String(labels.length)} detail="User-owned database" icon={Tags} tone="amber" />
        <MetricTile label="Tracked Wallets" value={String(wallets.length)} detail="Watchlist coverage" icon={WalletCards} />
      </div>

      <Panel title="Label Management" eyebrow="Manual database, CSV backup, bulk upload">
        <LabelManager wallets={wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, address: wallet.address, chain: wallet.chain }))} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel title="Wallet Scores" eyebrow="Transparent scoring">
          <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
            {smartWallets.length === 0 ? (
              <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">No scored wallets yet.</div>
            ) : (
              smartWallets.map(({ wallet, score }) => (
                <Link key={wallet.id} href={`/wallets/${wallet.id}`} className="block py-3 hover:text-[#2563eb] dark:hover:text-[#7dd3fc]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{wallet.name}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
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
                    </div>
                    <div className="w-28 shrink-0">
                      <div className="mb-1 text-right text-sm font-medium">{score}</div>
                      <div className="h-2 rounded-full bg-[#e4e9e4] dark:bg-[#26302b]">
                        <div className="h-2 rounded-full bg-[#38bdf8]" style={{ width: `${Math.min(100, score)}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Label Database" eyebrow="Manual intelligence">
          <div className="divide-y divide-[#e2e6e1] dark:divide-[#25302b]">
            {labels.length === 0 ? (
              <div className="py-8 text-sm text-[#64706b] dark:text-[#9aa39e]">No labels yet.</div>
            ) : (
              labels.map((label) => (
                <div key={label.id} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{label.name}</div>
                      <div className="mt-1 text-sm text-[#64706b] dark:text-[#9aa39e]">
                        {label.type} {label.wallet ? `- ${label.wallet.name}` : ""}
                      </div>
                    </div>
                    <StatusPill tone={label.confidence >= 80 ? "good" : "warn"}>{label.confidence}%</StatusPill>
                  </div>
                  {label.notes ? <p className="mt-2 text-sm text-[#64706b] dark:text-[#9aa39e]">{label.notes}</p> : null}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
