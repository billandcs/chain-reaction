import { prisma } from "./db";
import { WalletInput } from "./validators";

export async function listWallets() {
  return prisma.wallet.findMany({
    orderBy: [{ trackingEnabled: "desc" }, { updatedAt: "desc" }],
    include: {
      labels: true,
      balances: {
        include: { token: true },
        orderBy: { usdValue: "desc" },
      },
      _count: { select: { transactions: true, incoming: true, outgoing: true } },
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
      incoming: { include: { token: true }, orderBy: { timestamp: "desc" }, take: 20 },
      outgoing: { include: { token: true }, orderBy: { timestamp: "desc" }, take: 20 },
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

  const tokenTotals = new Map<string, { symbol: string; name: string; usdValue: number; amount: number }>();
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

  const topTokens = Array.from(tokenTotals.values()).sort((a, b) => b.usdValue - a.usdValue).slice(0, 6);
  const activeWallets = wallets.filter((wallet) => wallet.trackingEnabled).length;
  const smartWallets = wallets.filter((wallet) => wallet.labels.some((label) => label.type === "Smart Money")).length;

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
