import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { labelSchema } from "@/lib/validators";
import { listLabels } from "@/lib/repositories";

export async function GET() {
  return NextResponse.json(await listLabels());
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = labelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid label." }, { status: 400 });
  }

  const label = await prisma.walletLabel.create({
    data: {
      walletId: parsed.data.walletId || null,
      address: parsed.data.address?.toLowerCase() || null,
      chain: parsed.data.chain,
      type: parsed.data.type,
      name: parsed.data.name,
      confidence: parsed.data.confidence,
      notes: parsed.data.notes || null,
      sourceUrl: parsed.data.sourceUrl || null,
    },
  });

  return NextResponse.json(label, { status: 201 });
}
