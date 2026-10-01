import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { itemSchema, fieldErrors } from "@/lib/validators";
import { requireSession } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ items: await db.listItems() });
}

export async function POST(req: NextRequest) {
  try {
    requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const now = new Date().toISOString();
  const item = await db.saveItem({
    id: `itm_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`,
    title: parsed.data.title,
    details: parsed.data.details,
    status: parsed.data.status,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ item }, { status: 201 });
}
