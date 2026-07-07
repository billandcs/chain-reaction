"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Panel, StatusPill } from "./ui";

type Status = {
  adapter: string;
  databaseUrl: string;
  githubReady: boolean;
  alchemyReady: boolean;
  etherscanReady: boolean;
  rpcReady: boolean;
  priceReady: boolean;
  aiReady: boolean;
  tradingEnabled: boolean;
  messages: Record<string, string>;
  adapterReadiness: { ready: boolean; message: string };
};

export function SettingsStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/settings/status")
      .then((response) => response.json())
      .then(setStatus);
  }, []);

  if (!status) {
    return (
      <Panel title="Provider Readiness" eyebrow="Runtime">
        <div className="text-sm text-[#64706b] dark:text-[#9aa39e]">Loading provider status</div>
      </Panel>
    );
  }

  const rows = [
    ["Database", status.databaseUrl === "configured", "DATABASE_URL"],
    ["GitHub", status.githubReady, status.messages.github],
    ["Chain Data", status.adapterReadiness.ready, status.adapterReadiness.message],
    ["Price Data", status.priceReady, status.messages.price],
    ["AI", status.aiReady, status.messages.ai],
    ["Trading", !status.tradingEnabled, status.messages.trading],
  ] as const;

  return (
    <Panel title="Provider Readiness" eyebrow="Runtime" action={<StatusPill tone="info">{status.adapter}</StatusPill>}>
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map(([label, ready, message]) => (
          <div key={label} className="flex items-start justify-between gap-4 rounded-lg border border-[#dde4ef] bg-white p-3 dark:border-[#253246] dark:bg-[#0b111c]">
            <div className="min-w-0">
              <div className="font-medium">{label}</div>
              <div className="mt-1 text-sm leading-6 text-[#626b7a] dark:text-[#98a4b3]">{message}</div>
            </div>
            {ready ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-[#38bdf8]" size={20} />
            ) : (
              <CircleAlert className="mt-0.5 shrink-0 text-[#c87911]" size={20} />
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
