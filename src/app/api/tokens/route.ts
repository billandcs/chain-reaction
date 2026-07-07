import { NextResponse } from "next/server";
import { createToken, listTokens } from "@/lib/repositories";
import { tokenSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json(await listTokens());
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = tokenSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid token." },
      { status: 400 },
    );
  }

  try {
    const token = await createToken(parsed.data);
    return NextResponse.json(token, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add token.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
