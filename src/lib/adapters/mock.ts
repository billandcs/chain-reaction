import { AdapterError, ChainAdapter } from "./types";

const eth = {
  chain: "ethereum",
  address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  symbol: "ETH",
  name: "Ether",
  decimals: 18,
  coingeckoId: "ethereum",
};

const usdc = {
  chain: "ethereum",
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  coingeckoId: "usd-coin",
};

const pepe = {
  chain: "ethereum",
  address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
  symbol: "PEPE",
  name: "Pepe",
  decimals: 18,
  coingeckoId: "pepe",
};

function assertAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new AdapterError("Invalid EVM address.", "invalid_address");
  }
}

function seededNumber(address: string, mod: number) {
  return (
    address
      .toLowerCase()
      .slice(2)
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod
  );
}

export const mockAdapter: ChainAdapter = {
  name: "mock",
  async readiness() {
    return { ready: true, message: "Mock adapter ready. No API keys required." };
  },
  async getWalletBalances(address) {
    assertAddress(address);
    const seed = seededNumber(address, 100);
    return [
      { token: eth, amount: 1.2 + seed / 80, usdValue: 4200 + seed * 17, blockNumber: 20264000 + seed },
      { token: usdc, amount: 2400 + seed * 11, usdValue: 2400 + seed * 11, blockNumber: 20264000 + seed },
      { token: pepe, amount: 12000000 + seed * 90000, usdValue: 160 + seed * 3, blockNumber: 20264000 + seed },
    ];
  },
  async getTransactions(address) {
    assertAddress(address);
    const seed = seededNumber(address, 90);
    return Array.from({ length: 6 }).map((_, index) => ({
      chain: "ethereum",
      hash: `0x${(seed + index).toString(16).padStart(64, "0")}`,
      fromAddress: index % 2 === 0 ? address : "0x1111111111111111111111111111111111111111",
      toAddress: index % 2 === 0 ? "0x2222222222222222222222222222222222222222" : address,
      valueNative: Number((0.05 + index * 0.08).toFixed(4)),
      gasFeeNative: Number((0.002 + index * 0.0003).toFixed(5)),
      blockNumber: 20264000 - index * 1200,
      timestamp: new Date(Date.now() - index * 6 * 60 * 60 * 1000),
      status: "success",
    }));
  },
  async getTokenTransfers(address) {
    assertAddress(address);
    const seed = seededNumber(address, 75);
    return [usdc, eth, pepe, usdc, eth].map((token, index) => {
      const incoming = index % 2 === 0;
      const amount = token.symbol === "ETH" ? 0.4 + index * 0.2 : 800 + seed * 4 + index * 120;
      return {
        chain: "ethereum",
        hash: `0x${(seed + index + 500).toString(16).padStart(64, "0")}`,
        token,
        fromAddress: incoming ? "0x3333333333333333333333333333333333333333" : address,
        toAddress: incoming ? address : "0x4444444444444444444444444444444444444444",
        amount,
        usdValue: token.symbol === "ETH" ? amount * 3500 : token.symbol === "USDC" ? amount : amount * 0.000012,
        timestamp: new Date(Date.now() - index * 4 * 60 * 60 * 1000),
      };
    });
  },
  async getTokenMetadata(tokenAddress) {
    assertAddress(tokenAddress);
    return [eth, usdc, pepe].find((token) => token.address.toLowerCase() === tokenAddress.toLowerCase()) ?? {
      chain: "ethereum",
      address: tokenAddress.toLowerCase(),
      symbol: "TOKEN",
      name: "Unknown Token",
      decimals: 18,
    };
  },
};
