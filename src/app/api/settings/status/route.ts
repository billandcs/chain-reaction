import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";
import { getChainAdapter } from "@/lib/adapters/registry";

export async function GET() {
  const adapter = getChainAdapter();
  const readiness = await adapter.readiness();

  return NextResponse.json({
    ...getEnvStatus(),
    adapterReadiness: readiness,
  });
}
