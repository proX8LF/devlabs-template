import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settingsSchema, fieldErrors } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ settings: await db.getSettings() });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const saved = await db.saveSettings({ ...parsed.data, updatedAt: new Date().toISOString() });
  return NextResponse.json({ settings: saved });
}
