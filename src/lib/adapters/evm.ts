import { AdapterError, ChainAdapter } from "./types";

function assertAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new AdapterError("Invalid EVM address.", "invalid_address");
  }
}

export const evmAdapter: ChainAdapter = {
  name: "evm",
  async readiness() {
    const hasProvider = Boolean(
      process.env.ALCHEMY_API_KEY ||
        process.env.ETHERSCAN_API_KEY ||
        process.env.COVALENT_API_KEY ||
        process.env.ETHEREUM_RPC_URL ||
        process.env.BASE_RPC_URL,
    );

    return {
      ready: hasProvider,
      message: hasProvider
        ? "EVM provider configuration found."
        : "Set ALCHEMY_API_KEY, ETHERSCAN_API_KEY, COVALENT_API_KEY, or an RPC URL.",
    };
  },
  async getWalletBalances(address) {
    assertAddress(address);
    throw new AdapterError("Real EVM balance sync is configured but not implemented in this local scaffold.", "provider_error");
  },
  async getTransactions(address) {
    assertAddress(address);
    throw new AdapterError(
      "Real EVM transaction sync is configured but not implemented in this local scaffold.",
      "provider_error",
    );
  },
  async getTokenTransfers(address) {
    assertAddress(address);
    throw new AdapterError(
      "Real EVM transfer sync is configured but not implemented in this local scaffold.",
      "provider_error",
    );
  },
  async getTokenMetadata(tokenAddress) {
    assertAddress(tokenAddress);
    return {
      chain: "ethereum",
      address: tokenAddress.toLowerCase(),
      symbol: "TOKEN",
      name: "EVM Token",
      decimals: 18,
    };
  },
};
