"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectionLabel, StatusBadge } from "@/components/ui";
import { useLang } from "@/components/ui";
import type { Item } from "@/lib/types";

export default function ItemDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLang();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch(`/api/items/${params.id}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "missing");
      setItem(j.item);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function toggle() {
    if (!item) return;
    const r = await fetch(`/api/items/${item.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, details: item.details, status: item.status === "done" ? "open" : "done" }),
    });
    const j = await r.json();
    if (r.ok) setItem(j.item);
  }

  async function duplicate() {
    if (!item) return;
    const r = await fetch("/api/items", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${item.title} (copy)`, details: item.details, status: "open" }),
    });
    const j = await r.json();
    if (r.ok) router.push(`/dashboard/items/${j.item.id}`);
  }

  async function remove() {
    if (!item || !confirm(t.del_confirm)) return;
    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    router.push("/dashboard/items");
  }

  if (error && !item) return <><SectionLabel>500</SectionLabel><h1 className="display">{t.not_found}</h1><p>{error}</p><Link href="/dashboard/items" className="btn secondary">{t.back}</Link></>;
  if (!item) return <p className="mono">{t.loading}</p>;

  return (
    <>
      <SectionLabel>{t.items_kicker}</SectionLabel>
      <h1 className="display" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }} dir="auto">{item.title}</h1>
      <p style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <StatusBadge status={item.status} label={item.status === "done" ? t.s_done : t.s_open} />
        <span className="mono mut" style={{ fontSize: 11 }} dir="ltr">{item.createdAt.slice(0, 10)}</span>
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <button className="btn secondary" onClick={toggle}>{item.status === "done" ? t.s_open : t.s_done}</button>
        <button className="btn ghost" onClick={duplicate}>{t.duplicate}</button>
        <button className="btn ghost" onClick={remove} style={{ color: "var(--danger)" }}>{t.del}</button>
        <Link href="/dashboard/items" className="btn ghost">{t.back}</Link>
      </div>
      <section className="panel" style={{ marginTop: 32 }} aria-label={t.f_details}>
        <div className="panel-head"><p className="panel-title">{t.f_details}</p></div>
        <div className="panel-body">
          <p dir="auto" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{item.details}</p>
          <p className="mono mut" style={{ fontSize: 11, marginTop: 16 }} dir="ltr">
            {t.created} {item.createdAt.slice(0, 10)} · {t.updated} {item.updatedAt.slice(0, 10)}
          </p>
        </div>
      </section>
    </>
  );
}
