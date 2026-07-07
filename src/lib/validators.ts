import { z } from "zod";

export const chains = ["ethereum", "base", "arbitrum", "optimism", "polygon", "bnb"] as const;

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
