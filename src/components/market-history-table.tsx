"use client";

import { ArrowDownRight, ArrowUpRight, Database } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { MarketHistoryRow } from "@/lib/market-history";
import { formatMonthDayUtc, formatTimeUtc } from "@/lib/format";
import { StatusPill } from "./ui";

const usd = new Intl.NumberFormat("en-US", {
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

function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={positive ? "inline-flex items-center gap-1 font-mono text-[#38bdf8]" : "inline-flex items-center gap-1 font-mono text-[#fb7185]"}>
      <Icon size={14} />
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

function Sparkline({ row }: { row: MarketHistoryRow }) {
  const data = row.points.map((point) => ({
    price: point.price,
    date: formatMonthDayUtc(point.timestamp),
  }));
  const positive = row.change30d >= 0;

  return (
    <div className="h-12 w-full min-w-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            formatter={(value) => [usd.format(Number(value)), row.symbol]}
            labelFormatter={(label) => label}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.22)",
              background: "#0f1724",
              color: "#f3f7fb",
              boxShadow: "0 8px 24px rgba(2, 6, 23, 0.28)",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={positive ? "#38bdf8" : "#fb7185"}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketHistoryTable({ rows }: { rows: MarketHistoryRow[] }) {
  return (
    <section className="rounded-lg border border-[#d8e0ec] bg-[#fbfcff] dark:border-[#1d2838] dark:bg-[#0b111c]">
      <div className="flex flex-col gap-3 border-b border-[#d8e0ec] px-4 py-3 dark:border-[#1d2838] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
            Priority market history
          </div>
          <h2 className="mt-1 text-base font-semibold">BTC / ETH / SOL / SUI Historical Quotes</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="info">30D</StatusPill>
          <StatusPill tone={rows.some((row) => row.source === "coingecko") ? "good" : "warn"}>
            {rows.some((row) => row.source === "coingecko") ? "CoinGecko live" : "Fallback"}
          </StatusPill>
        </div>
      </div>

      <div className="hidden overflow-hidden md:block">
        <div className="grid grid-cols-[0.9fr_0.8fr_0.7fr_0.7fr_0.7fr_0.85fr_0.8fr_1.1fr] gap-3 border-b border-[#d8e0ec] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#748096] dark:border-[#1d2838] dark:text-[#8795a8]">
          <div>Asset</div>
          <div>Price</div>
          <div>24h</div>
          <div>7d</div>
          <div>30d</div>
          <div>30d Range</div>
          <div>Volume</div>
          <div>Trend</div>
        </div>
        <div className="divide-y divide-[#e2e7f0] dark:divide-[#223047]">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[0.9fr_0.8fr_0.7fr_0.7fr_0.7fr_0.85fr_0.8fr_1.1fr] items-center gap-3 px-4 py-3">
              <div>
                <div className="font-semibold">{row.symbol}</div>
                <div className="text-xs text-[#626b7a] dark:text-[#98a4b3]">{row.name}</div>
              </div>
              <div className="font-mono font-semibold">{usd.format(row.currentPrice)}</div>
              <ChangeCell value={row.change24h} />
              <ChangeCell value={row.change7d} />
              <ChangeCell value={row.change30d} />
              <div className="font-mono text-xs text-[#626b7a] dark:text-[#98a4b3]">
                {usd.format(row.low30d)} - {usd.format(row.high30d)}
              </div>
              <div className="font-mono text-sm">{compactUsd.format(row.volume24h)}</div>
              <Sparkline row={row} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-[#dde4ef] bg-white p-3 dark:border-[#253246] dark:bg-[#101824]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{row.symbol}</div>
                <div className="text-xs text-[#626b7a] dark:text-[#98a4b3]">{row.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold">{usd.format(row.currentPrice)}</div>
                <div className="mt-1 text-xs text-[#626b7a] dark:text-[#98a4b3]">{compactUsd.format(row.volume24h)} vol</div>
              </div>
            </div>
            <div className="mt-3">
              <Sparkline row={row} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">24h</div>
                <ChangeCell value={row.change24h} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">7d</div>
                <ChangeCell value={row.change7d} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">30d</div>
                <ChangeCell value={row.change30d} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#626b7a] dark:text-[#98a4b3]">
              <Database size={13} />
              {row.source} · updated {formatTimeUtc(row.updatedAt)} UTC
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
