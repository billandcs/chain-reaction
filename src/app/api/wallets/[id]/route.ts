import { NextResponse } from "next/server";
import { deleteWallet, getWallet } from "@/lib/repositories";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const wallet = await getWallet(id);

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
  }

  return NextResponse.json(wallet);
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  await deleteWallet(id);
  return NextResponse.json({ ok: true });
}
