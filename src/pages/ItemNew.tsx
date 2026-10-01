import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field, SectionLabel, Select, TextInput, Textarea } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { db, newId } from "@/lib/db";
import { itemSchema } from "@/lib/validators";

export default function ItemNew() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("open");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = itemSchema.safeParse({ title, details, status });
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path.join(".") || "_";
        if (!out[k]) out[k] = issue.message;
      }
      setErrors(out);
      setError(t.retry);
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const item = db.saveItem({
        id: newId(), title: parsed.data.title, details: parsed.data.details,
        status: parsed.data.status, createdAt: now, updatedAt: now,
      });
      navigate(`/dashboard/items/${item.id}`);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionLabel>{t.items_kicker}</SectionLabel>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{t.new_title}</h1>
      {error && <div role="alert" style={{ border: "1px solid var(--danger)", color: "var(--danger)", padding: 12, marginTop: 16 }}>{error}</div>}
      <form onSubmit={save} style={{ marginTop: 24, maxWidth: 640 }}>
        <Field label={t.f_title} required htmlFor="title" error={errors.title}>
          <TextInput id="title" dir="auto" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t.f_details} required htmlFor="details" error={errors.details}>
          <Textarea id="details" dir="auto" value={details} onChange={(e) => setDetails(e.target.value)} />
        </Field>
        <Field label={t.f_status} htmlFor="status">
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">{t.s_open}</option>
            <option value="done">{t.s_done}</option>
          </Select>
        </Field>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? t.saving : t.save} <span className="arr">→</span></button>
          <Link to="/dashboard/items" className="btn secondary">{t.cancel}</Link>
        </div>
      </form>
    </>
  );
}
