import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SectionLabel, StatusBadge } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { db } from "@/lib/db";

const STATUS_ORDER = ["open", "done"] as const;

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function storageBytes(): number {
  try {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("tpl-")) n += (localStorage.getItem(k) ?? "").length * 2;
    }
    return n;
  } catch {
    return 0;
  }
}

export default function DashboardHome() {
  const { t } = useLang();
  const items = useMemo(() => db.listItems(), []);
  const open = items.filter((x) => x.status === "open").length;
  const done = items.filter((x) => x.status === "done").length;

  // attention: open items without details + stale (>30d) untouched items
  const attn = items.filter((x) => x.status === "open").slice(0, 5);

  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      label: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`,
      count: items.filter((x) => x.createdAt.slice(0, 10) === iso).length,
    });
  }
  const maxDay = Math.max(4, ...days.map((d) => d.count));
  const statusCounts = STATUS_ORDER.map((s) => ({ s, n: items.filter((x) => x.status === s).length }));
  const maxStatus = Math.max(1, ...statusCounts.map((x) => x.n));

  const kpis = [
    { label: t.m_total, value: items.length, href: "/dashboard/items", hot: false },
    { label: t.m_open, value: open, href: "/dashboard/items", hot: open > 0 },
    { label: t.m_done, value: done, href: "/dashboard/items", hot: false },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <SectionLabel>{t.dash_kicker}</SectionLabel>
          <h1 className="display" style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}>{t.dash_title}</h1>
        </div>
        <div style={{ paddingBottom: 6 }}>
          <Link to="/dashboard/items/new" className="btn">{t.nav_new} <span className="arr">→</span></Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", marginTop: 24, border: "1px solid var(--line)" }}>
        {kpis.map((k, i) => (
          <Link key={k.label} to={k.href} style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 12, padding: "12px 16px", borderInlineEnd: i < kpis.length - 1 ? "1px solid var(--line)" : "0", borderTop: k.hot ? "2px solid var(--cobalt)" : "2px solid transparent" }}>
            <span style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}><bdi dir="ltr">{k.value}</bdi></span>
            <span className="mono mut" style={{ fontSize: 10 }}>{k.label}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 32, alignItems: "start" }}>
        <div style={{ flex: "7 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
          <section className="panel" aria-label="attention">
            <div className="panel-head">
              <p className="panel-title">{t.recent}</p>
              <Link to="/dashboard/items" className="mono" style={{ fontSize: 11, textDecoration: "none" }}>{t.view_all}</Link>
            </div>
            <div className="panel-body flush">
              <div className="rows">
                {attn.map((r, i) => (
                  <Link key={r.id} to={`/dashboard/items/${r.id}`} className="row-item" style={{ padding: "12px 16px" }}>
                    <span className="mono mut">{String(i + 1).padStart(2, "0")}</span>
                    <span><strong style={{ fontWeight: 500, fontSize: 15 }}>{r.title}</strong><br /><span className="mono mut" style={{ fontSize: 11 }} dir="ltr">{r.createdAt.slice(0, 10)}</span></span>
                    <span className="hide-m"><StatusBadge status={r.status} label={r.status === "done" ? t.s_done : t.s_open} /></span>
                    <span className="mono mut hide-m" style={{ fontSize: 11 }} dir="ltr">{r.createdAt.slice(5, 10)}</span>
                  </Link>
                ))}
                {!attn.length && <p className="hint" style={{ padding: "14px 18px" }}>{t.empty_title}</p>}
              </div>
            </div>
          </section>

          <section className="panel" aria-label="recent">
            <div className="panel-head">
              <p className="panel-title">{t.m_total}</p>
              <span className="count-pill"><bdi dir="ltr">{items.length}</bdi></span>
            </div>
            <div className="panel-body flush">
              <div className="rows">
                {items.slice(0, 5).map((r, i) => (
                  <Link key={r.id} to={`/dashboard/items/${r.id}`} className="row-item" style={{ padding: "12px 16px" }}>
                    <span className="mono mut">{String(i + 1).padStart(2, "0")}</span>
                    <span><strong style={{ fontWeight: 500, fontSize: 15 }}>{r.title}</strong></span>
                    <span className="hide-m"><StatusBadge status={r.status} label={r.status === "done" ? t.s_done : t.s_open} /></span>
                    <span className="mono mut hide-m" style={{ fontSize: 11 }} dir="ltr">{r.createdAt.slice(0, 10)}</span>
                  </Link>
                ))}
                {!items.length && <p className="hint" style={{ padding: "14px 18px" }}>{t.empty_title}</p>}
              </div>
            </div>
          </section>
        </div>

        <div style={{ flex: "5 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
          <section className="panel" aria-label="chart">
            <div className="panel-head">
              <p className="panel-title">14D</p>
              <span className="count-pill"><bdi dir="ltr">{items.length}</bdi></span>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 110, borderBottom: "1px solid var(--line)" }} role="img">
                {days.map((d) => (
                  <div key={d.label} title={`${d.label}: ${d.count}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                    <div style={{ height: `${Math.max(3, Math.round((d.count / maxDay) * 100))}%`, background: d.count > 0 ? "var(--cobalt)" : "var(--line)", minHeight: 3 }} />
                  </div>
                ))}
              </div>
              <div className="mono mut" style={{ fontSize: 10, display: "flex", justifyContent: "space-between", marginTop: 4 }} dir="ltr">
                <span>{days[0]?.label}</span><span>{days[13]?.label}</span>
              </div>
            </div>
          </section>

          <section className="panel" aria-label="status">
            <div className="panel-head"><p className="panel-title">STATUS</p></div>
            <div className="panel-body" style={{ display: "grid", gap: 12 }}>
              {statusCounts.map(({ s, n }) => (
                <Link key={s} to="/dashboard/items" style={{ textDecoration: "none", display: "block" }}>
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s === "done" ? t.s_done : t.s_open}</span>
                    <bdi dir="ltr" className="mono mut" style={{ fontSize: 11 }}>{n}</bdi>
                  </span>
                  <span style={{ display: "block", height: 8, border: "1px solid var(--line)", position: "relative" }}>
                    <span style={{ position: "absolute", insetInlineStart: 0, top: 0, bottom: 0, width: `${Math.round((n / maxStatus) * 100)}%`, background: s === "done" ? "var(--ok)" : "var(--muted)" }} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel" aria-label="storage">
            <div className="panel-head"><p className="panel-title">STORAGE</p></div>
            <div className="panel-body">
              <table className="data"><tbody>
                <tr><th>{t.m_total}</th><td><bdi dir="ltr">{items.length} · {fmtSize(storageBytes())}</bdi></td></tr>
              </tbody></table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
