import { prisma } from "./db";
import { getChainAdapter } from "./adapters/registry";

export async function syncWallet(walletId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const adapter = getChainAdapter();
  const job = await prisma.syncJob.create({
    data: {
      walletId,
      chain: wallet.chain,
      adapter: adapter.name,
      status: "running",
      startedAt: new Date(),
    },
  });

  try {
    const [balances, transactions, transfers] = await Promise.all([
      adapter.getWalletBalances(wallet.address),
      adapter.getTransactions(wallet.address),
      adapter.getTokenTransfers(wallet.address),
    ]);

    for (const balance of balances) {
      const token = await prisma.token.upsert({
        where: {
          chain_address: {
            chain: balance.token.chain,
            address: balance.token.address.toLowerCase(),
          },
        },
        create: {
          chain: balance.token.chain,
          address: balance.token.address.toLowerCase(),
          symbol: balance.token.symbol,
          name: balance.token.name,
          decimals: balance.token.decimals,
          coingeckoId: balance.token.coingeckoId,
        },
        update: {
          symbol: balance.token.symbol,
          name: balance.token.name,
          decimals: balance.token.decimals,
          coingeckoId: balance.token.coingeckoId,
        },
      });

      await prisma.tokenBalance.upsert({
        where: {
          walletId_tokenId: {
            walletId,
            tokenId: token.id,
          },
        },
        create: {
          walletId,
          tokenId: token.id,
          amount: balance.amount,
          usdValue: balance.usdValue,
          blockNumber: balance.blockNumber,
        },
        update: {
          amount: balance.amount,
          usdValue: balance.usdValue,
          blockNumber: balance.blockNumber,
          syncedAt: new Date(),
        },
      });

      if (balance.usdValue && balance.amount > 0) {
        await prisma.priceSnapshot.create({
          data: {
            tokenId: token.id,
            priceUsd: balance.usdValue / balance.amount,
            source: adapter.name,
          },
        });
      }
    }

    for (const transaction of transactions) {
      await prisma.transaction.upsert({
        where: {
          chain_hash_walletId: {
            chain: transaction.chain,
            hash: transaction.hash,
            walletId,
          },
        },
        create: {
          walletId,
          chain: transaction.chain,
          hash: transaction.hash,
          fromAddress: transaction.fromAddress.toLowerCase(),
          toAddress: transaction.toAddress?.toLowerCase(),
          valueNative: transaction.valueNative,
          gasFeeNative: transaction.gasFeeNative,
          blockNumber: transaction.blockNumber,
          timestamp: transaction.timestamp,
          status: transaction.status,
        },
        update: {
          status: transaction.status,
          timestamp: transaction.timestamp,
        },
      });
    }

    for (const transfer of transfers) {
      const token = await prisma.token.upsert({
        where: {
          chain_address: {
            chain: transfer.token.chain,
            address: transfer.token.address.toLowerCase(),
          },
        },
        create: {
          chain: transfer.token.chain,
          address: transfer.token.address.toLowerCase(),
          symbol: transfer.token.symbol,
          name: transfer.token.name,
          decimals: transfer.token.decimals,
          coingeckoId: transfer.token.coingeckoId,
        },
        update: {
          symbol: transfer.token.symbol,
          name: transfer.token.name,
        },
      });

      await prisma.transfer.upsert({
        where: {
          chain_hash_tokenId_fromAddress_toAddress: {
            chain: transfer.chain,
            hash: transfer.hash,
            tokenId: token.id,
            fromAddress: transfer.fromAddress.toLowerCase(),
            toAddress: transfer.toAddress.toLowerCase(),
          },
        },
        create: {
          chain: transfer.chain,
          hash: transfer.hash,
          tokenId: token.id,
          fromAddress: transfer.fromAddress.toLowerCase(),
          toAddress: transfer.toAddress.toLowerCase(),
          fromWalletId: transfer.fromAddress.toLowerCase() === wallet.address ? wallet.id : null,
          toWalletId: transfer.toAddress.toLowerCase() === wallet.address ? wallet.id : null,
          amount: transfer.amount,
          usdValue: transfer.usdValue,
          timestamp: transfer.timestamp,
        },
        update: {
          amount: transfer.amount,
          usdValue: transfer.usdValue,
          timestamp: transfer.timestamp,
        },
      });
    }

    const totalValueUsd = balances.reduce((sum, balance) => sum + (balance.usdValue ?? 0), 0);

    await prisma.portfolioSnapshot.create({
      data: {
        walletId,
        totalValueUsd,
        chainBreakdown: JSON.stringify({ [wallet.chain]: totalValueUsd }),
        tokenBreakdown: JSON.stringify(
          balances.map((balance) => ({
            symbol: balance.token.symbol,
            value: balance.usdValue ?? 0,
          })),
        ),
      },
    });

    return prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "success",
        message: `Synced ${balances.length} balances, ${transactions.length} transactions, and ${transfers.length} transfers.`,
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error.";
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        message,
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}
