import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json()) as { read?: boolean };
  const event = await prisma.alertEvent.update({
    where: { id },
    data: {
      readAt: body.read === false ? null : new Date(),
    },
  });

  return NextResponse.json(event);
}
