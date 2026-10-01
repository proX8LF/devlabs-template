import Link from "next/link";
import { SectionLabel, StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { getDict, getServerLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const t = getDict(getServerLang());
  const items = await db.listItems();
  const open = items.filter((x) => x.status === "open").length;
  const done = items.filter((x) => x.status === "done").length;
  const kpis = [
    { label: t.m_total, value: items.length, href: "/dashboard/items" },
    { label: t.m_open, value: open, href: "/dashboard/items" },
    { label: t.m_done, value: done, href: "/dashboard/items" },
  ];
  return (
    <>
      <SectionLabel>{t.dash_kicker}</SectionLabel>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{t.dash_title}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", marginTop: 32, borderTop: "1px solid var(--line)", borderInlineStart: "1px solid var(--line)" }}>
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} style={{ textDecoration: "none", borderInlineEnd: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "20px" }}>
            <p className="mono mut" style={{ fontSize: 10, margin: 0 }}>{k.label}</p>
            <p style={{ fontSize: 36, margin: "4px 0 0", fontWeight: 300 }}><bdi dir="ltr">{k.value}</bdi></p>
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <SectionLabel>{t.recent}</SectionLabel>
        <Link href="/dashboard/items" className="mono" style={{ fontSize: 11, textDecoration: "none" }}>{t.view_all}</Link>
      </div>
      <div className="rows" style={{ marginTop: 8 }}>
        {items.slice(0, 6).map((r, i) => (
          <Link key={r.id} href={`/dashboard/items/${r.id}`} className="row-item">
            <span className="mono mut">{String(i + 1).padStart(2, "0")}</span>
            <span><strong style={{ fontWeight: 500 }}>{r.title}</strong><br /><span className="mono mut" style={{ fontSize: 11 }} dir="ltr">{r.createdAt.slice(0, 10)}</span></span>
            <span className="hide-m"><StatusBadge status={r.status} label={r.status === "done" ? t.s_done : t.s_open} /></span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
        {!items.length && <p className="hint">{t.empty_title}</p>}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <Link href="/dashboard/items/new" className="btn">{t.nav_new} <span className="arr">→</span></Link>
      </div>
    </>
  );
}
