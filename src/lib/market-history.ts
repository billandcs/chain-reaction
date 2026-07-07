export type MarketAssetId = "bitcoin" | "ethereum" | "solana" | "sui";

export type MarketHistoryPoint = {
  timestamp: number;
  price: number;
  volume: number;
};

export type MarketHistoryRow = {
  id: MarketAssetId;
  symbol: "BTC" | "ETH" | "SOL" | "SUI";
  name: string;
  source: "coingecko" | "fallback";
  currentPrice: number;
  change24h: number;
  change7d: number;
  change30d: number;
  high30d: number;
  low30d: number;
  volume24h: number;
  points: MarketHistoryPoint[];
  updatedAt: string;
};

const priorityAssets = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", base: 108000 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", base: 3600 },
  { id: "solana", symbol: "SOL", name: "Solana", base: 160 },
  { id: "sui", symbol: "SUI", name: "Sui", base: 3.1 },
] as const;

type CoinGeckoMarketChart = {
  prices?: [number, number][];
  total_volumes?: [number, number][];
};

function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function nearestPrice(points: MarketHistoryPoint[], targetTimestamp: number) {
  return points.reduce((nearest, point) =>
    Math.abs(point.timestamp - targetTimestamp) < Math.abs(nearest.timestamp - targetTimestamp) ? point : nearest,
  ).price;
}

function summarize(
  asset: (typeof priorityAssets)[number],
  points: MarketHistoryPoint[],
  source: MarketHistoryRow["source"],
): MarketHistoryRow {
  const ordered = points.sort((a, b) => a.timestamp - b.timestamp);
  const latest = ordered.at(-1) ?? { timestamp: Date.now(), price: asset.base, volume: 0 };
  const now = latest.timestamp;
  const currentPrice = latest.price;
  const oneDay = nearestPrice(ordered, now - 24 * 60 * 60 * 1000);
  const sevenDays = nearestPrice(ordered, now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDays = ordered[0]?.price ?? currentPrice;
  const prices = ordered.map((point) => point.price);

  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    source,
    currentPrice,
    change24h: pctChange(currentPrice, oneDay),
    change7d: pctChange(currentPrice, sevenDays),
    change30d: pctChange(currentPrice, thirtyDays),
    high30d: Math.max(...prices, currentPrice),
    low30d: Math.min(...prices, currentPrice),
    volume24h: latest.volume,
    points: ordered,
    updatedAt: new Date(now).toISOString(),
  };
}

function fallbackSeries(asset: (typeof priorityAssets)[number]) {
  const now = Date.now();
  return Array.from({ length: 31 }).map((_, index) => {
    const age = 30 - index;
    const wave = Math.sin(index / 2.7) * 0.045;
    const drift = (index - 15) * 0.0025;
    const price = asset.base * (1 + wave + drift);
    return {
      timestamp: now - age * 24 * 60 * 60 * 1000,
      price,
      volume: asset.base * 120000 * (1 + Math.cos(index / 3) * 0.18),
    };
  });
}

async function fetchAssetHistory(asset: (typeof priorityAssets)[number]) {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: "30",
  });
  const headers: HeadersInit = {
    accept: "application/json",
  };

  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${asset.id}/market_chart?${params}`, {
    headers,
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`CoinGecko ${asset.symbol} request failed with ${response.status}.`);
  }

  const data = (await response.json()) as CoinGeckoMarketChart;
  const prices = data.prices ?? [];
  const volumes = data.total_volumes ?? [];

  if (prices.length < 2) {
    throw new Error(`CoinGecko returned too few ${asset.symbol} points.`);
  }

  const points = prices.map(([timestamp, price], index) => ({
    timestamp,
    price,
    volume: volumes[index]?.[1] ?? 0,
  }));

  return summarize(asset, points, "coingecko");
}

export async function getPriorityMarketHistory(): Promise<MarketHistoryRow[]> {
  return Promise.all(
    priorityAssets.map(async (asset) => {
      try {
        return await fetchAssetHistory(asset);
      } catch {
        return summarize(asset, fallbackSeries(asset), "fallback");
      }
    }),
  );
}
