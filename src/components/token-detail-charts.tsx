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
import { formatMonthDayUtc } from "@/lib/format";

const gridColor = "rgba(148, 163, 184, 0.18)";
const axisColor = "#8491a5";

function shortMoney(value: number) {
  if (Math.abs(value) >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function TokenPriceLineChart({
  data,
  emptyLabel = "No price history yet",
}: {
  data: { timestamp: Date | string | number; price: number }[];
  emptyLabel?: string;
}) {
  if (data.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#2b3a50] text-sm text-[#8491a5]">
        {emptyLabel}
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: formatMonthDayUtc(point.timestamp),
    price: Number(point.price.toFixed(point.price < 1 ? 6 : 2)),
  }));

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ left: 0, right: 12, top: 10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tickFormatter={shortMoney}
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip
            cursor={{ stroke: "#38bdf8", strokeOpacity: 0.22 }}
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Price",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.24)",
              background: "#0f1724",
              color: "#f3f7fb",
              boxShadow: "0 8px 24px rgba(2, 6, 23, 0.28)",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#38bdf8"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TokenFlowBarChart({
  data,
}: {
  data: { label: string; inflow: number; outflow: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#2b3a50] text-sm text-[#8491a5]">
        No transfer flow history yet
      </div>
    );
  }

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ left: 0, right: 12, top: 10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={shortMoney}
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            formatter={(value, name) => [
              `$${Number(value).toLocaleString()}`,
              name === "inflow" ? "Inflow" : "Outflow",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.24)",
              background: "#0f1724",
              color: "#f3f7fb",
              boxShadow: "0 8px 24px rgba(2, 6, 23, 0.28)",
            }}
          />
          <Bar dataKey="inflow" radius={[5, 5, 0, 0]} maxBarSize={58}>
            {data.map((_, index) => (
              <Cell key={`in-${index}`} fill="#38bdf8" />
            ))}
          </Bar>
          <Bar dataKey="outflow" radius={[5, 5, 0, 0]} maxBarSize={58}>
            {data.map((_, index) => (
              <Cell key={`out-${index}`} fill="#fb7185" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
