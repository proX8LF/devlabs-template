import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { itemSchema, fieldErrors } from "@/lib/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const item = await db.getItem(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await db.getItem(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const updated = await db.saveItem({
    ...existing,
    title: parsed.data.title,
    details: parsed.data.details,
    status: parsed.data.status,
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await db.deleteItem(params.id);
  return NextResponse.json({ ok: true });
}
