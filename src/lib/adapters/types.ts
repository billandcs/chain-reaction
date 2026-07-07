export type AdapterToken = {
  chain: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId?: string;
};

export type AdapterTokenBalance = {
  token: AdapterToken;
  amount: number;
  usdValue?: number;
  blockNumber?: number;
};

export type AdapterTransaction = {
  chain: string;
  hash: string;
  fromAddress: string;
  toAddress?: string;
  valueNative: number;
  gasFeeNative?: number;
  blockNumber?: number;
  timestamp: Date;
  status: string;
};

export type AdapterTransfer = {
  chain: string;
  hash: string;
  token: AdapterToken;
  fromAddress: string;
  toAddress: string;
  amount: number;
  usdValue?: number;
  timestamp: Date;
};

export type ChainAdapter = {
  name: string;
  readiness(): Promise<{ ready: boolean; message: string }>;
  getWalletBalances(address: string): Promise<AdapterTokenBalance[]>;
  getTransactions(address: string, cursor?: string): Promise<AdapterTransaction[]>;
  getTokenTransfers(address: string, cursor?: string): Promise<AdapterTransfer[]>;
  getTokenMetadata(tokenAddress: string): Promise<AdapterToken>;
};

export class AdapterError extends Error {
  constructor(
    message: string,
    public code: "missing_api_key" | "rate_limited" | "unsupported_chain" | "invalid_address" | "provider_error",
  ) {
    super(message);
  }
}
