"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectionLabel, Field, TextInput, Textarea, Select } from "@/components/ui";
import { useLang } from "@/components/ui";

export default function NewItem() {
  const router = useRouter();
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("open");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/items", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, details, status }),
      });
      const j = await r.json();
      if (!r.ok) {
        if (j.fields) setErrors(j.fields);
        throw new Error(j.error ?? "failed");
      }
      router.push(`/dashboard/items/${j.item.id}`);
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
          <Link href="/dashboard/items" className="btn secondary">{t.cancel}</Link>
        </div>
      </form>
    </>
  );
}
