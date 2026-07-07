export type MarketHistoryRow = {
  id: string;
  rank: number;
  marketCapRank: number | null;
  symbol: string;
  name: string;
  image?: string;
  source: "coingecko" | "fallback";
  currentPrice: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume24h: number;
  points: { timestamp: number; price: number }[];
  updatedAt: string;
};

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_30d_in_currency?: number | null;
  sparkline_in_7d?: {
    price?: number[];
  };
  last_updated?: string;
};

const fallbackAssets = [
  [
    "bitcoin",
    "BTC",
    "Bitcoin",
    64073.42,
    35620000000,
    1260000000000,
    1,
    "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
  ],
  [
    "ethereum",
    "ETH",
    "Ethereum",
    1799.9,
    16350000000,
    217000000000,
    2,
    "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  ],
  [
    "tether",
    "USDT",
    "Tether",
    1,
    13200000000,
    112000000000,
    3,
    "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661",
  ],
  [
    "solana",
    "SOL",
    "Solana",
    82.24,
    2610000000,
    38600000000,
    6,
    "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  ],
  [
    "usd-coin",
    "USDC",
    "USDC",
    1,
    2200000000,
    32000000000,
    7,
    "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  ],
  [
    "ripple",
    "XRP",
    "XRP",
    0.52,
    1850000000,
    29200000000,
    8,
    "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442",
  ],
  [
    "dogecoin",
    "DOGE",
    "Dogecoin",
    0.12,
    1120000000,
    17600000000,
    9,
    "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png?1696501409",
  ],
  [
    "cardano",
    "ADA",
    "Cardano",
    0.41,
    920000000,
    14500000000,
    10,
    "https://coin-images.coingecko.com/coins/images/975/large/cardano.png?1696502090",
  ],
  [
    "sui",
    "SUI",
    "Sui",
    0.75,
    294670000,
    2600000000,
    20,
    "https://coin-images.coingecko.com/coins/images/26375/large/sui-ocean-square.png?1727791290",
  ],
  [
    "chainlink",
    "LINK",
    "Chainlink",
    13.1,
    280000000,
    8100000000,
    15,
    "https://coin-images.coingecko.com/coins/images/877/large/Chainlink_Logo_500.png?1760023405",
  ],
  [
    "avalanche-2",
    "AVAX",
    "Avalanche",
    24.9,
    250000000,
    10100000000,
    13,
    "https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png?1696512369",
  ],
  [
    "tron",
    "TRX",
    "TRON",
    0.13,
    230000000,
    11600000000,
    12,
    "https://coin-images.coingecko.com/coins/images/1094/large/photo_2026-04-13_09-59-16.png?1776048311",
  ],
  [
    "polkadot",
    "DOT",
    "Polkadot",
    6.1,
    210000000,
    8700000000,
    14,
    "https://coin-images.coingecko.com/coins/images/12171/large/polkadot.jpg?1766533446",
  ],
  [
    "the-open-network",
    "TON",
    "Toncoin",
    5.8,
    205000000,
    20200000000,
    11,
    "https://coin-images.coingecko.com/coins/images/17980/large/Gram_Circular_Badge.png?1781524778",
  ],
  [
    "shiba-inu",
    "SHIB",
    "Shiba Inu",
    0.000017,
    198000000,
    10000000000,
    16,
    "https://coin-images.coingecko.com/coins/images/11939/large/shiba.png?1696511800",
  ],
  [
    "litecoin",
    "LTC",
    "Litecoin",
    73.5,
    185000000,
    5500000000,
    18,
    "https://coin-images.coingecko.com/coins/images/2/large/litecoin.png?1696501400",
  ],
  [
    "bitcoin-cash",
    "BCH",
    "Bitcoin Cash",
    382,
    175000000,
    7500000000,
    17,
    "https://coin-images.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1696501932",
  ],
  [
    "near",
    "NEAR",
    "NEAR Protocol",
    4.8,
    160000000,
    5300000000,
    19,
    "https://coin-images.coingecko.com/coins/images/10365/large/near.jpg?1696510367",
  ],
  [
    "aptos",
    "APT",
    "Aptos",
    7.1,
    150000000,
    3600000000,
    21,
    "https://coin-images.coingecko.com/coins/images/26455/large/Aptos-Network-Symbol-Black-RGB-1x.png?1761789140",
  ],
  [
    "uniswap",
    "UNI",
    "Uniswap",
    8.4,
    140000000,
    5050000000,
    22,
    "https://coin-images.coingecko.com/coins/images/12504/large/uniswap-logo.png?1720676669",
  ],
] as const;

function pctFallback(index: number, scale: number) {
  return Math.sin(index * 1.7) * scale;
}

function fallbackSparkline(base: number, index: number) {
  const now = Date.now();
  return Array.from({ length: 96 }).map((_, pointIndex) => ({
    timestamp: now - (95 - pointIndex) * 60 * 60 * 1000,
    price:
      base *
      (1 +
        Math.sin((pointIndex + index) / 7) * 0.025 +
        Math.cos(pointIndex / 13) * 0.015),
  }));
}

function normalizeMarket(
  row: CoinGeckoMarket,
  index: number,
  source: MarketHistoryRow["source"],
): MarketHistoryRow {
  const sparkline = row.sparkline_in_7d?.price ?? [];
  const now = row.last_updated
    ? new Date(row.last_updated).getTime()
    : Date.now();
  const points = sparkline.length
    ? sparkline.map((price, pointIndex) => ({
        timestamp: now - (sparkline.length - 1 - pointIndex) * 60 * 60 * 1000,
        price,
      }))
    : fallbackSparkline(row.current_price ?? 0, index);

  return {
    id: row.id,
    rank: index + 1,
    marketCapRank: row.market_cap_rank,
    symbol: row.symbol.toUpperCase(),
    name: row.name,
    image: row.image,
    source,
    currentPrice: row.current_price ?? 0,
    change24h: row.price_change_percentage_24h_in_currency ?? 0,
    change7d: row.price_change_percentage_7d_in_currency ?? 0,
    change30d: row.price_change_percentage_30d_in_currency ?? 0,
    marketCap: row.market_cap ?? 0,
    volume24h: row.total_volume ?? 0,
    points,
    updatedAt: new Date(now).toISOString(),
  };
}

function fallbackRows(): MarketHistoryRow[] {
  return fallbackAssets
    .map(
      (
        [id, symbol, name, price, volume, marketCap, marketCapRank, image],
        index,
      ) =>
        normalizeMarket(
          {
            id,
            symbol,
            name,
            current_price: price,
            total_volume: volume,
            market_cap: marketCap,
            market_cap_rank: marketCapRank,
            price_change_percentage_24h_in_currency: pctFallback(index, 3),
            price_change_percentage_7d_in_currency: pctFallback(index + 2, 11),
            price_change_percentage_30d_in_currency: pctFallback(index + 4, 24),
            image,
            last_updated: new Date().toISOString(),
          },
          index,
          "fallback",
        ),
    )
    .sort((a, b) => b.volume24h - a.volume24h)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function getPriorityMarketHistory(): Promise<MarketHistoryRow[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "volume_desc",
    per_page: "20",
    page: "1",
    sparkline: "true",
    price_change_percentage: "24h,7d,30d",
  });
  const headers: HeadersInit = {
    accept: "application/json",
  };

  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?${params}`,
      {
        headers,
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(9000),
      },
    );

    if (!response.ok) {
      throw new Error(
        `CoinGecko markets request failed with ${response.status}.`,
      );
    }

    const data = (await response.json()) as CoinGeckoMarket[];

    if (!Array.isArray(data) || data.length < 5) {
      throw new Error("CoinGecko returned too few market rows.");
    }

    return data
      .slice(0, 20)
      .map((row, index) => normalizeMarket(row, index, "coingecko"));
  } catch {
    return fallbackRows();
  }
}
