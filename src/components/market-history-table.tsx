"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Database,
  Info,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { MarketHistoryRow } from "@/lib/market-history";
import { formatMonthDayUtc, formatTimeUtc } from "@/lib/format";

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

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const timeframes = ["5m", "10m", "1h", "6h", "24h", "7D", "30D"];

function accentForSymbol(symbol: string) {
  const accents = [
    "from-[#38bdf8] to-[#6366f1]",
    "from-[#22d3ee] to-[#14b8a6]",
    "from-[#a78bfa] to-[#38bdf8]",
    "from-[#f59e0b] to-[#ef4444]",
    "from-[#94a3b8] to-[#38bdf8]",
  ];

  return accents[symbol.charCodeAt(0) % accents.length];
}

function activityScore(row: MarketHistoryRow) {
  return Math.max(
    26,
    Math.round(Math.log10(Math.max(row.volume24h, 1)) * 118 - row.rank * 4),
  );
}

function pressureScore(row: MarketHistoryRow) {
  const raw =
    Math.abs(row.change24h) * 18 +
    Math.abs(row.change7d) * 4 +
    (row.symbol.charCodeAt(0) % 23);
  return Math.min(96, Math.max(8, Math.round(raw)));
}

function ChangeCell({ value }: { value: number }) {
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

function SortLabel({
  children,
  info = false,
}: {
  children: React.ReactNode;
  info?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {info ? <Info size={13} /> : null}
      {children}
      <ArrowUpDown size={13} className="text-[#6f7e93]" />
    </span>
  );
}

function TokenBadge({
  row,
  large = false,
}: {
  row: MarketHistoryRow;
  large?: boolean;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${accentForSymbol(
        row.symbol,
      )} font-semibold text-white shadow-[0_0_24px_rgba(56,189,248,0.18)] ring-1 ring-white/10 ${large ? "size-10 text-sm" : "size-8 text-[11px]"}`}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {row.symbol.slice(0, 2)}
      </span>
      {row.image ? (
        <Image
          src={row.image}
          alt=""
          width={large ? 40 : 32}
          height={large ? 40 : 32}
          className="relative z-10 h-full w-full rounded-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.opacity = "0";
          }}
        />
      ) : null}
    </span>
  );
}

function Sparkline({
  row,
  compact = false,
}: {
  row: MarketHistoryRow;
  compact?: boolean;
}) {
  const data = row.points.map((point) => ({
    price: point.price,
    date: formatMonthDayUtc(point.timestamp),
  }));
  const positive = row.change30d >= 0;

  return (
    <div className={compact ? "h-14 w-full" : "h-10 w-full min-w-[128px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id={`spark-${row.id}`} x1="0" x2="1" y1="0" y2="0">
              <stop
                offset="0%"
                stopColor={positive ? "#38bdf8" : "#fb7185"}
                stopOpacity={0.55}
              />
              <stop
                offset="100%"
                stopColor={positive ? "#7dd3fc" : "#fda4af"}
                stopOpacity={1}
              />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            formatter={(value) => [usd.format(Number(value)), row.symbol]}
            labelFormatter={(label) => label}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.24)",
              background: "rgba(15, 23, 36, 0.94)",
              color: "#f3f7fb",
              boxShadow: "0 14px 34px rgba(2, 6, 23, 0.34)",
              backdropFilter: "blur(16px)",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={`url(#spark-${row.id})`}
            strokeWidth={compact ? 2.5 : 2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PressureBar({ row }: { row: MarketHistoryRow }) {
  const positive = row.change24h >= 0;
  const width = pressureScore(row);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={
          positive
            ? "w-20 text-right font-mono text-[#dbeafe]"
            : "w-20 text-right font-mono text-[#fb7185]"
        }
      >
        {positive ? "" : "-"}
        {compactUsd.format(row.volume24h * (width / 100))}
      </span>
      <span className="h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-[#172235]">
        <span
          className={
            positive
              ? "block h-full rounded-full bg-[#38bdf8]"
              : "block h-full rounded-full bg-[#fb7185]"
          }
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}

function PreviewCard({ row }: { row: MarketHistoryRow }) {
  return (
    <div className="pointer-events-none absolute left-14 top-10 z-20 hidden w-[330px] rounded-lg border border-[#334155]/80 bg-[#1a2331]/96 p-4 opacity-0 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition group-hover:opacity-100 dark:lg:block">
      <div className="flex items-start gap-3">
        <TokenBadge row={row} large />
        <div>
          <div className="text-2xl font-semibold tracking-normal text-[#f8fafc]">
            {row.symbol}
          </div>
          <div className="text-sm text-[#9fb0c5]">{row.name}</div>
        </div>
      </div>
      <div className="mt-4">
        <Sparkline row={row} compact />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-[#8b98aa]">Price</div>
          <div className="mt-1 font-mono text-lg font-semibold text-[#f8fafc]">
            {usd.format(row.currentPrice)}
          </div>
        </div>
        <div>
          <div className="text-[#8b98aa]">24h Change</div>
          <div className="mt-1 text-lg font-semibold">
            <ChangeCell value={row.change24h} />
          </div>
        </div>
        <div>
          <div className="text-[#8b98aa]">Market Cap</div>
          <div className="mt-1 font-mono text-lg font-semibold text-[#f8fafc]">
            {compactUsd.format(row.marketCap)}
          </div>
        </div>
        <div>
          <div className="text-[#8b98aa]">24h Volume</div>
          <div className="mt-1 font-mono text-lg font-semibold text-[#f8fafc]">
            {compactUsd.format(row.volume24h)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketHistoryTable({ rows }: { rows: MarketHistoryRow[] }) {
  const live = rows.some((row) => row.source === "coingecko");

  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="glass-divider flex flex-col gap-5 border-b px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="flex items-center gap-1 text-xl font-semibold tracking-normal text-[#111827] dark:text-[#f8fafc]">
              Token Screener{" "}
              <ChevronRight size={18} className="text-[#7dd3fc]" />
            </h2>
            <div className="mt-5 flex gap-7 text-base font-semibold">
              {["Default", "Most Viewed", "Watchlist"].map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={
                    index === 0
                      ? "relative pb-3 text-[#38bdf8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#38bdf8]"
                      : "pb-3 text-[#9aa6b8] transition hover:text-[#dbeafe]"
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="inline-flex w-fit overflow-hidden rounded-lg border border-[#2b3a50] bg-[#0f1724]/52 p-0.5 font-mono text-sm text-[#cbd5e1]">
            {timeframes.map((range) => (
              <button
                key={range}
                type="button"
                className={
                  range === "10m"
                    ? "rounded-md border border-[#38bdf8] bg-[#123047]/70 px-3 py-1.5 text-[#38bdf8] shadow-[0_0_22px_rgba(56,189,248,0.14)]"
                    : "px-3 py-1.5 transition hover:bg-white/[0.05] hover:text-white"
                }
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-[#2b3a50] bg-[#0f1724]/45 text-sm font-semibold">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-[#dbeafe]"
              >
                <span className="size-2 rounded-full bg-[#7dd3fc]" />
                All Markets
              </button>
              <button
                type="button"
                className="border-l border-[#2b3a50] px-3 py-2 text-[#9aa6b8]"
              >
                Tokens
              </button>
              <button
                type="button"
                className="border-l border-[#2b3a50] bg-[#143149]/72 px-3 py-2 text-[#38bdf8]"
              >
                Perps Watch
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2b3a50] bg-[#0f1724]/45 px-3 py-2 text-sm font-semibold text-[#cbd5e1]"
            >
              Sectors <ChevronDown size={15} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-[#28415b] bg-[#0f2638]/70 px-3 py-2 text-xs font-medium text-[#7dd3fc]">
              {live ? "CoinGecko live" : "Fallback"}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2b3a50] bg-[#0f1724]/45 px-3 py-2 text-sm font-semibold text-[#dbeafe]"
            >
              <Plus size={16} /> Filter
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2b3a50] bg-[#0f1724]/45 px-3 py-2 text-sm font-semibold text-[#dbeafe]"
            >
              <SlidersHorizontal size={16} /> All Signals{" "}
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden overflow-visible lg:block">
        <div className="glass-divider grid grid-cols-[1.55fr_1.05fr_0.85fr_1fr_0.85fr_1fr_0.8fr_1.35fr_1.05fr] gap-4 border-b px-5 py-3 text-sm font-medium text-[#7f8da3]">
          <SortLabel>Token</SortLabel>
          <SortLabel>Price</SortLabel>
          <SortLabel>24h Chg%</SortLabel>
          <SortLabel info>Volume</SortLabel>
          <SortLabel>Activity</SortLabel>
          <SortLabel>Market Cap</SortLabel>
          <SortLabel>30D</SortLabel>
          <SortLabel info>Flow Pressure</SortLabel>
          <SortLabel>Trend</SortLabel>
        </div>
        <div className="divide-y divide-[#223047]/80">
          {rows.map((row) => (
            <div
              key={row.id}
              className="group relative grid grid-cols-[1.55fr_1.05fr_0.85fr_1fr_0.85fr_1fr_0.8fr_1.35fr_1.05fr] items-center gap-4 px-5 py-3 transition hover:bg-white/[0.055]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <TokenBadge row={row} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-[#f8fafc]">
                      {row.symbol}
                    </span>
                    <span className="font-mono text-xs text-[#64748b]">
                      #{row.rank}
                    </span>
                  </div>
                  <div className="truncate text-xs text-[#8b98aa]">
                    {row.name}
                  </div>
                </div>
                <PreviewCard row={row} />
              </div>
              <div className="flex items-center gap-2 font-mono font-semibold text-[#f8fafc]">
                {usd.format(row.currentPrice)}
                <Link
                  href={`/tokens/market/${row.id}`}
                  className="rounded-md border border-[#2b3a50] bg-white/[0.05] px-2 py-1 font-sans text-xs font-semibold text-[#38bdf8] transition hover:border-[#38bdf8]/60 hover:bg-[#123047]/70"
                >
                  Inspect
                </Link>
              </div>
              <ChangeCell value={row.change24h} />
              <div className="font-mono font-semibold text-[#e2e8f0]">
                {compactUsd.format(row.volume24h)}
              </div>
              <div className="font-mono text-[#e2e8f0]">
                {whole.format(activityScore(row))}
              </div>
              <div className="font-mono text-[#e2e8f0]">
                {compactUsd.format(row.marketCap)}
              </div>
              <ChangeCell value={row.change30d} />
              <PressureBar row={row} />
              <Sparkline row={row} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 lg:hidden">
        {rows.map((row) => (
          <div key={row.id} className="glass-subpanel rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <TokenBadge row={row} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>{row.symbol}</span>
                    <span className="font-mono text-xs text-[#98a4b3]">
                      #{row.rank}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-[#626b7a] dark:text-[#98a4b3]">
                    {row.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold">
                  {usd.format(row.currentPrice)}
                </div>
                <div className="mt-1 text-xs text-[#626b7a] dark:text-[#98a4b3]">
                  {compactUsd.format(row.volume24h)} vol
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Sparkline row={row} compact />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                  24h
                </div>
                <ChangeCell value={row.change24h} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                  30D
                </div>
                <ChangeCell value={row.change30d} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#748096] dark:text-[#8795a8]">
                  Activity
                </div>
                <div className="font-mono font-semibold">
                  {whole.format(activityScore(row))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#626b7a] dark:text-[#98a4b3]">
              <Database size={13} />
              {row.source} · mcap {compactUsd.format(row.marketCap)} · updated{" "}
              {formatTimeUtc(row.updatedAt)} UTC
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
