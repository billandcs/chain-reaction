import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import { chains, labelTypes } from "@/lib/validators";

const evmAddress = /^0x[a-fA-F0-9]{40}$/;

function pick(row: Record<string, string>, ...keys: string[]) {
  const lowerEntries = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
  for (const key of keys) {
    const value = lowerEntries[key.toLowerCase()];
    if (value) return value.trim();
  }
  return "";
}

export async function POST(request: Request) {
  const content = await request.text();
  const rows = parseCsv(content);
  let imported = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const chain = pick(row, "chain") || "ethereum";
    const address = pick(row, "address", "walletAddress").toLowerCase();
    const type = pick(row, "type", "labelType") || "Custom";
    const name = pick(row, "name", "label") || type;
    const confidenceRaw = pick(row, "confidence") || "70";
    const notes = pick(row, "notes");
    const sourceUrl = pick(row, "sourceUrl", "source_url", "source");

    if (!chains.includes(chain as (typeof chains)[number])) {
      errors.push(`Line ${line}: unsupported chain "${chain}".`);
      continue;
    }

    if (!labelTypes.includes(type as (typeof labelTypes)[number])) {
      errors.push(`Line ${line}: unsupported label type "${type}".`);
      continue;
    }

    if (address && !evmAddress.test(address)) {
      errors.push(`Line ${line}: invalid EVM address.`);
      continue;
    }

    const confidence = Number(confidenceRaw);
    if (!Number.isInteger(confidence) || confidence < 0 || confidence > 100) {
      errors.push(`Line ${line}: confidence must be an integer from 0 to 100.`);
      continue;
    }

    const wallet = address
      ? await prisma.wallet.findUnique({
          where: {
            chain_address: {
              chain,
              address,
            },
          },
        })
      : null;

    await prisma.walletLabel.create({
      data: {
        walletId: wallet?.id ?? null,
        address: address || null,
        chain,
        type,
        name,
        confidence,
        notes: notes || null,
        sourceUrl: sourceUrl || null,
      },
    });
    imported += 1;
  }

  return NextResponse.json({
    imported,
    errors,
  });
}
