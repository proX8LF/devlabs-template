"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionLabel, StatusBadge, EmptyState } from "@/components/ui";
import { useLang } from "@/components/ui";
import type { Item } from "@/lib/types";

export default function ItemsList() {
  const { t } = useLang();
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/items");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "failed");
      setItems(j.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const shown = items.filter(
    (x) =>
      (!q || x.title.toLowerCase().includes(q.toLowerCase())) &&
      (status === "all" || x.status === status)
  );

  async function remove(id: string) {
    if (!confirm(t.del_confirm)) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <SectionLabel>{t.items_kicker}</SectionLabel>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{t.items_title}</h1>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <input className="input" placeholder={t.search_ph} value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 300 }} aria-label="search" />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 160 }} aria-label="status">
          <option value="all">{t.f_all}</option>
          <option value="open">{t.s_open}</option>
          <option value="done">{t.s_done}</option>
        </select>
        <Link href="/dashboard/items/new" className="btn">{t.nav_new} <span className="arr">→</span></Link>
      </div>
      {loading && <p className="mono" style={{ marginTop: 24 }}>{t.loading}</p>}
      {error && <p role="alert" style={{ color: "var(--danger)" }}>{error} <button className="btn ghost" onClick={load}>{t.retry}</button></p>}
      {!loading && !error && !shown.length && (
        <div style={{ marginTop: 24 }}>
          <EmptyState code="404" title={t.empty_title} action={<Link href="/dashboard/items/new" className="btn">{t.empty_cta} <span className="arr">→</span></Link>} />
        </div>
      )}
      {!!shown.length && (
        <section className="panel" style={{ marginTop: 24 }} aria-label={t.items_title}>
          <div className="panel-head">
            <p className="panel-title">{t.m_total}</p>
            <span className="count-pill"><bdi dir="ltr">{shown.length}</bdi></span>
          </div>
          <div className="panel-body flush">
            <div className="rows">
              {shown.map((r, i) => (
                <div key={r.id} className="row-item" style={{ cursor: "default" }}>
                  <span className="mono mut">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <Link href={`/dashboard/items/${r.id}`} style={{ fontWeight: 500, textDecoration: "none" }}>{r.title}</Link><br />
                    <span className="mono mut" style={{ fontSize: 11 }} dir="ltr">{r.createdAt.slice(0, 10)}</span>
                  </span>
                  <span className="hide-m"><StatusBadge status={r.status} label={r.status === "done" ? t.s_done : t.s_open} /></span>
                  <span style={{ display: "flex", gap: 4 }}>
                    <Link href={`/dashboard/items/${r.id}`} className="btn ghost" aria-label={r.title}>↗</Link>
                    <button className="btn ghost" aria-label={t.del} onClick={() => remove(r.id)}>✕</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
