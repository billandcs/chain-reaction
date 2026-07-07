import { prisma } from "../src/lib/db";
import { syncWallet } from "../src/lib/sync";

async function main() {
  const wallets = [
    {
      name: "Demo Smart Money",
      address: "0x742d35cc6634c0532925a3b844bc454e4438f44e",
      chain: "ethereum",
      label: "Smart Money",
      confidence: 88,
    },
    {
      name: "Demo Whale",
      address: "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
      chain: "ethereum",
      label: "Whale",
      confidence: 82,
    },
  ];

  for (const item of wallets) {
    const wallet = await prisma.wallet.upsert({
      where: {
        chain_address: {
          chain: item.chain,
          address: item.address,
        },
      },
      create: {
        name: item.name,
        address: item.address,
        chain: item.chain,
        labels: {
          create: {
            type: item.label,
            name: item.label,
            confidence: item.confidence,
            address: item.address,
            chain: item.chain,
          },
        },
      },
      update: {
        name: item.name,
        trackingEnabled: true,
      },
    });

    await syncWallet(wallet.id);
  }

  const rule = await prisma.alertRule.upsert({
    where: { id: "seed-large-flow-rule" },
    create: {
      id: "seed-large-flow-rule",
      name: "Large watched wallet flow",
      type: "wallet_flow_over_usd",
      thresholdUsd: 10000,
    },
    update: {},
  });

  await prisma.alertEvent.upsert({
    where: { id: "seed-alert-event" },
    create: {
      id: "seed-alert-event",
      ruleId: rule.id,
      title: "Demo large flow detected",
      message: "A watched wallet moved more than the configured demo threshold.",
      severity: "info",
    },
    update: {},
  });

  await prisma.aiReport.upsert({
    where: { id: "seed-ai-report" },
    create: {
      id: "seed-ai-report",
      subjectType: "daily",
      title: "Demo Daily Briefing",
      prompt: "Summarize local demo wallet changes.",
      content:
        "Demo wallets show ETH and USDC exposure with several recent transfers. This report references seeded local records only.",
      citationsJson: JSON.stringify(["Wallet", "TokenBalance", "Transfer"]),
      model: "local-demo",
    },
    update: {},
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
