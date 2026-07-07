import { NextResponse } from "next/server";
import { listLabels } from "@/lib/repositories";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const labels = await listLabels();
  const headers = ["chain", "address", "type", "name", "confidence", "notes", "sourceUrl", "walletName"];
  const csv = toCsv(
    headers,
    labels.map((label) => ({
      chain: label.chain,
      address: label.address ?? label.wallet?.address ?? "",
      type: label.type,
      name: label.name,
      confidence: label.confidence,
      notes: label.notes ?? "",
      sourceUrl: label.sourceUrl ?? "",
      walletName: label.wallet?.name ?? "",
    })),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chain-reaction-wallet-labels.csv"`,
    },
  });
}
