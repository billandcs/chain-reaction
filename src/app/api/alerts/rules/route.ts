import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { alertRuleSchema } from "@/lib/validators";

export async function GET() {
  const rules = await prisma.alertRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = alertRuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid alert rule." },
      { status: 400 },
    );
  }

  const rule = await prisma.alertRule.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      thresholdUsd: parsed.data.thresholdUsd,
      tokenAddress: parsed.data.tokenAddress?.toLowerCase(),
      walletId: parsed.data.walletId,
      enabled: parsed.data.enabled,
      configJson: JSON.stringify({ source: "manual" }),
    },
  });

  return NextResponse.json(rule, { status: 201 });
}
