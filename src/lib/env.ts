const truthy = new Set(["1", "true", "yes", "on"]);

export function getEnvStatus() {
  const githubReady = Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER);
  const alchemyReady = Boolean(process.env.ALCHEMY_API_KEY);
  const etherscanReady = Boolean(process.env.ETHERSCAN_API_KEY);
  const rpcReady = Boolean(process.env.ETHEREUM_RPC_URL || process.env.BASE_RPC_URL);
  const priceReady = Boolean(process.env.COINGECKO_API_KEY);
  const aiReady = Boolean(process.env.OPENAI_API_KEY || process.env.LOCAL_LLM_BASE_URL);
  const tradingEnabled = truthy.has((process.env.ENABLE_TRADING ?? "").toLowerCase());

  return {
    adapter: process.env.CHAIN_REACTION_ADAPTER || "mock",
    databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
    githubReady,
    alchemyReady,
    etherscanReady,
    rpcReady,
    priceReady,
    aiReady,
    tradingEnabled,
    messages: {
      github: githubReady ? "GitHub automation can run." : "Set GITHUB_TOKEN and GITHUB_OWNER.",
      chain:
        alchemyReady || etherscanReady || rpcReady
          ? "At least one EVM data source is configured."
          : "Using mock adapter until an API key or RPC URL is configured.",
      price: priceReady ? "CoinGecko key configured." : "Price sync will use local fallback values.",
      ai: aiReady ? "AI summaries can be wired up." : "AI report generation is disabled.",
      trading: tradingEnabled
        ? "Trading flag is enabled, but MVP execution routes are still absent."
        : "Trading is disabled for MVP.",
    },
  };
}
