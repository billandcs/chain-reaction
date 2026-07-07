import { describe, expect, it } from "vitest";
import { mockAdapter } from "../lib/adapters/mock";

describe("mockAdapter", () => {
  it("returns deterministic wallet data", async () => {
    const address = "0x742d35cc6634c0532925a3b844bc454e4438f44e";
    const balances = await mockAdapter.getWalletBalances(address);
    const transactions = await mockAdapter.getTransactions(address);
    const transfers = await mockAdapter.getTokenTransfers(address);

    expect(balances.length).toBeGreaterThan(0);
    expect(transactions).toHaveLength(6);
    expect(transfers).toHaveLength(5);
    expect(balances[0].token.chain).toBe("ethereum");
  });
});
