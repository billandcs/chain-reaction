import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  const result = await prisma.alertEvent.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ updated: result.count });
}
