import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { alertRuleUpdateSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = alertRuleUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid alert rule update.",
      },
      { status: 400 },
    );
  }

  const rule = await prisma.alertRule.update({
    where: { id },
    data: {
      ...parsed.data,
      tokenAddress: parsed.data.tokenAddress?.toLowerCase(),
    },
  });

  return NextResponse.json(rule);
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  await prisma.alertRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
