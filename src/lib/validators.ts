import { z } from "zod";

export const chains = [
  "ethereum",
  "base",
  "arbitrum",
  "optimism",
  "polygon",
  "bnb",
] as const;

export const labelTypes = [
  "Smart Money",
  "Whale",
  "CEX",
  "Fund",
  "VC",
  "Scammer",
  "Friend",
  "Custom",
] as const;

export const walletSchema = z.object({
  address: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid EVM address."),
  chain: z.enum(chains).default("ethereum"),
  name: z.string().trim().min(1, "Name is required.").max(80),
  labelType: z.enum(labelTypes).optional().default("Custom"),
  trackingEnabled: z.coerce.boolean().default(true),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const tokenSchema = z.object({
  address: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid EVM token address."),
  chain: z.enum(chains).default("ethereum"),
  symbol: z.string().trim().min(1).max(16).optional().or(z.literal("")),
  name: z.string().trim().min(1).max(80).optional().or(z.literal("")),
  decimals: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().min(0).max(36).optional(),
  ),
  coingeckoId: z.string().trim().max(100).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
});

const optionalEvmAddress = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid EVM address.")
    .optional(),
);

const optionalUsdThreshold = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().positive("Threshold must be greater than 0.").optional(),
);

export const alertRuleTypes = [
  "wallet_flow_over_usd",
  "smart_wallet_bought_token",
  "watched_token_inflow_spike",
  "portfolio_value_drop",
  "new_token_in_smart_wallet",
] as const;

export const alertRuleSchema = z.object({
  name: z.string().trim().min(1, "Rule name is required.").max(100),
  type: z.enum(alertRuleTypes),
  thresholdUsd: optionalUsdThreshold,
  tokenAddress: optionalEvmAddress,
  walletId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().optional(),
  ),
  enabled: z.coerce.boolean().default(true),
});

export const alertRuleUpdateSchema = alertRuleSchema.partial();

export const labelSchema = z.object({
  walletId: z.string().optional(),
  address: z.string().trim().optional(),
  chain: z.enum(chains).default("ethereum"),
  type: z.enum(labelTypes),
  name: z.string().trim().min(1).max(80),
  confidence: z.coerce.number().int().min(0).max(100).default(70),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
});

export type WalletInput = z.infer<typeof walletSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;
export type AlertRuleInput = z.infer<typeof alertRuleSchema>;
