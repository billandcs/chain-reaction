"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = ["#38bdf8", "#f59e0b", "#818cf8", "#fb7185", "#a78bfa", "#94a3b8"];
const gridColor = "rgba(148, 163, 184, 0.18)";
const axisColor = "#8491a5";

function shortMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function PortfolioLineChart({ data }: { data: { capturedAt: Date; totalValueUsd: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#cfd7d1] text-sm text-[#64706b] dark:border-[#2d3833] dark:text-[#9aa39e]">
        No snapshots yet
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: new Date(point.capturedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: Number(point.totalValueUsd.toFixed(2)),
  }));

  return (
    <div className="h-[240px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis tickFormatter={shortMoney} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} width={58} />
          <Tooltip
            cursor={{ stroke: "#38bdf8", strokeOpacity: 0.22 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Value"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(116,128,121,0.24)",
              background: "#0f1724",
              color: "#f3f7fb",
              boxShadow: "0 8px 24px rgba(2, 6, 23, 0.28)",
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TokenBarChart({ data }: { data: { symbol: string; usdValue: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#cfd7d1] text-sm text-[#64706b] dark:border-[#2d3833] dark:text-[#9aa39e]">
        No balances yet
      </div>
    );
  }

  return (
    <div className="h-[240px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis dataKey="symbol" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={shortMoney} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} width={58} />
          <Tooltip
            cursor={{ fill: "rgba(116, 128, 121, 0.08)" }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "USD"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(116,128,121,0.24)",
              background: "#0f1724",
              color: "#f3f7fb",
              boxShadow: "0 8px 24px rgba(2, 6, 23, 0.28)",
            }}
          />
          <Bar dataKey="usdValue" radius={[5, 5, 0, 0]} maxBarSize={76}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
