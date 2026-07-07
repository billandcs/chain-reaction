import { evmAdapter } from "./evm";
import { mockAdapter } from "./mock";

export function getChainAdapter() {
  return process.env.CHAIN_REACTION_ADAPTER === "evm" ? evmAdapter : mockAdapter;
}
