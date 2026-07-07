import { NextResponse } from "next/server";
import { syncWallet } from "@/lib/sync";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Context) {
  const { id } = await context.params;

  try {
    const job = await syncWallet(id);
    return NextResponse.json(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
