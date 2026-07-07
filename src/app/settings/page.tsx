import { KeyRound, Settings2 } from "lucide-react";
import { SettingsStatus } from "@/components/settings-status";
import { PageHeader, Panel, StatusPill } from "@/components/ui";

export default function SettingsPage() {
  const keys = [
    ["DATABASE_URL", "SQLite database path"],
    ["CHAIN_REACTION_ADAPTER", "mock or evm"],
    ["GITHUB_TOKEN", "Repo automation"],
    ["GITHUB_OWNER", "GitHub namespace"],
    ["ALCHEMY_API_KEY", "EVM provider"],
    ["ETHERSCAN_API_KEY", "Explorer fallback"],
    ["COINGECKO_API_KEY", "Price data"],
    ["ENABLE_TRADING", "Disabled by default"],
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Provider readiness, local environment keys, and MVP safety controls. Secrets stay out of Git."
        action={<StatusPill tone="warn">Trading disabled</StatusPill>}
      />
      <SettingsStatus />
      <Panel title="Environment Keys" eyebrow="Configuration surface" action={<KeyRound size={17} className="text-[#748079] dark:text-[#87938c]" />}>
        <div className="grid gap-3 md:grid-cols-2">
          {keys.map(([key, description]) => (
            <div key={key} className="rounded-lg border border-[#dce1db] bg-white p-3 dark:border-[#27312d] dark:bg-[#111614]">
              <code className="text-sm font-medium text-[#17201c] dark:text-[#eef2ef]">{key}</code>
              <div className="mt-1 text-xs text-[#64706b] dark:text-[#9aa39e]">{description}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="MVP Safety" eyebrow="Scope guardrails" action={<Settings2 size={17} className="text-[#748079] dark:text-[#87938c]" />}>
        <div className="grid gap-3 md:grid-cols-3">
          <StatusPill tone="good">No private keys</StatusPill>
          <StatusPill tone="warn">No trade execution</StatusPill>
          <StatusPill tone="info">Local database first</StatusPill>
        </div>
      </Panel>
    </div>
  );
}
