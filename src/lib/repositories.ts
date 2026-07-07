import { prisma } from "./db";
import { getChainAdapter } from "./adapters/registry";
import { TokenInput, WalletInput } from "./validators";

export async function listWallets() {
  return prisma.wallet.findMany({
    orderBy: [{ trackingEnabled: "desc" }, { updatedAt: "desc" }],
    include: {
      labels: true,
      balances: {
        include: { token: true },
        orderBy: { usdValue: "desc" },
      },
      _count: {
        select: { transactions: true, incoming: true, outgoing: true },
      },
    },
  });
}

export async function getWallet(id: string) {
  return prisma.wallet.findUnique({
    where: { id },
    include: {
      labels: true,
      balances: {
        include: {
          token: {
            include: {
              prices: {
                orderBy: { capturedAt: "desc" },
                take: 1,
              },
            },
          },
        },
        orderBy: { usdValue: "desc" },
      },
      transactions: { orderBy: { timestamp: "desc" }, take: 20 },
      incoming: {
        include: { token: true },
        orderBy: { timestamp: "desc" },
        take: 20,
      },
      outgoing: {
        include: { token: true },
        orderBy: { timestamp: "desc" },
        take: 20,
      },
      syncJobs: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
}

export async function createWallet(input: WalletInput) {
  const wallet = await prisma.wallet.upsert({
    where: {
      chain_address: {
        chain: input.chain,
        address: input.address.toLowerCase(),
      },
    },
    create: {
      address: input.address.toLowerCase(),
      chain: input.chain,
      name: input.name,
      trackingEnabled: input.trackingEnabled,
      notes: input.notes || null,
      labels: {
        create: {
          type: input.labelType || "Custom",
          name: input.labelType || "Custom",
          confidence: input.labelType === "Smart Money" ? 85 : 70,
          address: input.address.toLowerCase(),
          chain: input.chain,
        },
      },
    },
    update: {
      name: input.name,
      trackingEnabled: input.trackingEnabled,
      notes: input.notes || null,
      updatedAt: new Date(),
    },
  });

  return wallet;
}

export async function deleteWallet(id: string) {
  return prisma.wallet.delete({ where: { id } });
}

export async function listTokens() {
  return prisma.token.findMany({
    include: {
      balances: {
        include: { wallet: true },
        orderBy: { usdValue: "desc" },
      },
      transfers: { orderBy: { timestamp: "desc" }, take: 10 },
      prices: { orderBy: { capturedAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function captureTokenMarketSnapshot(
  tokenId: string,
  coingeckoId?: string | null,
) {
  if (!coingeckoId) return;

  const params = new URLSearchParams({
    ids: coingeckoId,
    vs_currencies: "usd",
    include_market_cap: "true",
    include_24hr_vol: "true",
    include_24hr_change: "true",
  });

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?${params}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(7000),
      },
    );

    if (!response.ok) return;

    const data = (await response.json()) as Record<
      string,
      {
        usd?: number;
        usd_market_cap?: number;
        usd_24h_vol?: number;
        usd_24h_change?: number;
      }
    >;
    const market = data[coingeckoId];

    if (!market?.usd) return;

    await prisma.priceSnapshot.create({
      data: {
        tokenId,
        priceUsd: market.usd,
        change24h: market.usd_24h_change,
        volume24hUsd: market.usd_24h_vol,
        marketCapUsd: market.usd_market_cap,
        source: "coingecko",
      },
    });
  } catch {
    // Token creation should still succeed when market data is unavailable.
  }
}

export async function createToken(input: TokenInput) {
  const adapter = getChainAdapter();
  const normalizedAddress = input.address.toLowerCase();
  const cleanedCoingeckoId = input.coingeckoId?.trim() || undefined;
  const cleanedLogoUrl = input.logoUrl?.trim() || undefined;
  const metadata = await adapter.getTokenMetadata(normalizedAddress);
  const token = await prisma.token.upsert({
    where: {
      chain_address: {
        chain: input.chain,
        address: normalizedAddress,
      },
    },
    create: {
      chain: input.chain,
      address: normalizedAddress,
      symbol: input.symbol?.trim() || metadata.symbol,
      name: input.name?.trim() || metadata.name,
      decimals: input.decimals ?? metadata.decimals,
      coingeckoId: cleanedCoingeckoId ?? metadata.coingeckoId,
      logoUrl: cleanedLogoUrl,
    },
    update: {
      symbol: input.symbol?.trim() || metadata.symbol,
      name: input.name?.trim() || metadata.name,
      decimals: input.decimals ?? metadata.decimals,
      coingeckoId: cleanedCoingeckoId ?? metadata.coingeckoId,
      logoUrl: cleanedLogoUrl,
      updatedAt: new Date(),
    },
  });

  await captureTokenMarketSnapshot(token.id, token.coingeckoId);
  return token;
}

export async function getToken(id: string) {
  return prisma.token.findUnique({
    where: { id },
    include: {
      balances: {
        include: {
          wallet: {
            include: { labels: true },
          },
        },
        orderBy: { usdValue: "desc" },
      },
      transfers: {
        include: {
          fromWallet: { include: { labels: true } },
          toWallet: { include: { labels: true } },
        },
        orderBy: { timestamp: "desc" },
        take: 40,
      },
      prices: {
        orderBy: { capturedAt: "asc" },
        take: 90,
      },
    },
  });
}

export async function listLabels() {
  return prisma.walletLabel.findMany({
    include: { wallet: true },
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getDashboardData() {
  const [wallets, transfers, snapshots, alerts] = await Promise.all([
    listWallets(),
    prisma.transfer.findMany({
      include: { token: true },
      orderBy: { timestamp: "desc" },
      take: 12,
    }),
    prisma.portfolioSnapshot.findMany({
      orderBy: { capturedAt: "asc" },
      take: 30,
    }),
    prisma.alertEvent.findMany({
      include: { rule: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const tokenTotals = new Map<
    string,
    { symbol: string; name: string; usdValue: number; amount: number }
  >();
  let totalValue = 0;

  for (const wallet of wallets) {
    for (const balance of wallet.balances) {
      const usdValue = balance.usdValue ?? 0;
      totalValue += usdValue;
      const existing = tokenTotals.get(balance.tokenId) ?? {
        symbol: balance.token.symbol,
        name: balance.token.name,
        usdValue: 0,
        amount: 0,
      };
      existing.usdValue += usdValue;
      existing.amount += balance.amount;
      tokenTotals.set(balance.tokenId, existing);
    }
  }

  const topTokens = Array.from(tokenTotals.values())
    .sort((a, b) => b.usdValue - a.usdValue)
    .slice(0, 6);
  const activeWallets = wallets.filter(
    (wallet) => wallet.trackingEnabled,
  ).length;
  const smartWallets = wallets.filter((wallet) =>
    wallet.labels.some((label) => label.type === "Smart Money"),
  ).length;

  return {
    totalValue,
    activeWallets,
    smartWallets,
    trackedWallets: wallets.length,
    topTokens,
    transfers,
    snapshots,
    alerts,
    wallets,
  };
}
