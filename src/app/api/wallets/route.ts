import { NextResponse } from "next/server";
import { createWallet, listWallets } from "@/lib/repositories";
import { walletSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json(await listWallets());
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = walletSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid wallet." }, { status: 400 });
  }

  const wallet = await createWallet(parsed.data);
  return NextResponse.json(wallet, { status: 201 });
}
