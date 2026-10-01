import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SectionLabel, StatusBadge } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { db, newId } from "@/lib/db";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLang();
  const [, setTick] = useState(0);
  const item = id ? db.getItem(id) : null;

  if (!item) {
    return (
      <>
        <SectionLabel>404</SectionLabel>
        <h1 className="display">{t.not_found}</h1>
        <Link to="/dashboard/items" className="btn secondary" style={{ marginTop: 16 }}>{t.back}</Link>
      </>
    );
  }

  function toggle() {
    db.saveItem({ ...item!, status: item!.status === "done" ? "open" : "done", updatedAt: new Date().toISOString() });
    setTick((x) => x + 1);
  }

  function duplicate() {
    const now = new Date().toISOString();
    const copy = db.saveItem({ ...item!, id: newId(), title: `${item!.title} (copy)`, status: "open", createdAt: now, updatedAt: now });
    navigate(`/dashboard/items/${copy.id}`);
  }

  function remove() {
    if (!confirm(t.del_confirm)) return;
    db.deleteItem(item!.id);
    navigate("/dashboard/items");
  }

  return (
    <>
      <SectionLabel>{t.items_kicker}</SectionLabel>
      <h1 className="display" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }} dir="auto">{item.title}</h1>
      <p style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <StatusBadge status={item.status} label={item.status === "done" ? t.s_done : t.s_open} />
        <span className="mono mut" style={{ fontSize: 11 }} dir="ltr">{item.createdAt.slice(0, 10)}</span>
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <button type="button" className="btn secondary" onClick={toggle}>{item.status === "done" ? t.s_open : t.s_done}</button>
        <button type="button" className="btn ghost" onClick={duplicate}>{t.duplicate}</button>
        <button type="button" className="btn ghost" onClick={remove} style={{ color: "var(--danger)" }}>{t.del}</button>
        <Link to="/dashboard/items" className="btn ghost">{t.back}</Link>
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
