import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/repositories";

export async function GET() {
  return NextResponse.json(await getDashboardData());
}
