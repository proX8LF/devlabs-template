"use client";
import { useEffect, useState } from "react";
import { SectionLabel, Field, TextInput } from "@/components/ui";
import { useLang } from "@/components/ui";

export default function SettingsPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ companyName: "", contactEmail: "", footerText: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((j) => {
      if (j.settings) setForm(j.settings);
    }).catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await r.json();
    setSaving(false);
    if (r.ok) {
      setForm(j.settings);
      setToast(t.saved);
      setTimeout(() => setToast(null), 2200);
    }
  }

  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  return (
    <>
      <SectionLabel>{t.settings_kicker}</SectionLabel>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{t.settings_title}</h1>
      <section className="panel" style={{ marginTop: 24, maxWidth: 640 }} aria-label={t.settings_title}>
        <div className="panel-body">
          <form onSubmit={save}>
            <Field label={t.f_company} htmlFor="c"><TextInput id="c" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} /></Field>
            <Field label={t.f_email} htmlFor="e"><TextInput id="e" dir="ltr" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
            <Field label={t.f_footer} htmlFor="f"><TextInput id="f" value={form.footerText} onChange={(e) => set("footerText", e.target.value)} /></Field>
            <button className="btn" type="submit" disabled={saving}>{saving ? t.saving : t.save} <span className="arr">→</span></button>
          </form>
        </div>
      </section>
      {toast && <div className="toast" role="status"><div>{toast}</div></div>}
    </>
  );
}
