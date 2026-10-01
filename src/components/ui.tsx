"use client";
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { LANG_COOKIE, THEME_COOKIE, getDict, type Lang } from "@/lib/i18n-dict";
import { site } from "@/lib/site";

/* ---------- i18n context ---------- */
import { createContext, useContext } from "react";
import type { Dict } from "@/lib/i18n-dict";

const Ctx = createContext<{ lang: Lang; t: Dict }>({ lang: "en", t: getDict("en") });
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const dict = getDict(lang);
  return <Ctx.Provider value={{ lang, t: dict }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);

export function LangToggle() {
  const { lang } = useLang();
  const other: Lang = lang === "ar" ? "en" : "ar";
  return (
    <button
      type="button" className="btn ghost mono" style={{ border: "1px solid var(--line)", padding: "8px 14px" }}
      onClick={() => {
        document.cookie = `${LANG_COOKIE}=${other};path=/;max-age=31536000`;
        window.location.reload();
      }}
      aria-label="language"
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      type="button" className="btn ghost" style={{ border: "1px solid var(--line)", padding: "8px 12px" }}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        document.cookie = `${THEME_COOKIE}=${next ? "dark" : "light"};path=/;max-age=31536000`;
      }}
      aria-label="theme"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ---------- primitives ---------- */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="tech-label">{children}</p>;
}

export function Field({ label, required, error, hint, children, htmlFor }: {
  label: string; required?: boolean; error?: string; hint?: string;
  children: React.ReactNode; htmlFor?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label} {required && <b aria-hidden="true">*</b>}</label>
      {children}
      {error ? <span className="err" role="alert">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`textarea ${props.className ?? ""}`} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`select ${props.className ?? ""}`} />;
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const color = status === "done" ? "var(--ok)" : "var(--muted)";
  return (
    <span className="badge"><i style={{ background: color }} />{label ?? status}</span>
  );
}

export function EmptyState({ code, title, action }: { code: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="grid-bg" style={{ border: "1px solid var(--line)", padding: "56px 32px" }}>
      <p className="tech-label">{code}</p>
      <h2 className="display" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>{title}</h2>
      {action && <div style={{ marginTop: 24 }}>{action}</div>}
    </div>
  );
}

/* ---------- site header ---------- */
export function SiteHeader({ actions }: { actions?: React.ReactNode }) {
  const { t } = useLang();
  return (
    <header className="site-header">
      <div className="header-frame">
        <Link href="/" className="brandlock" aria-label="home">
          {site.name}<br /><em>{site.accent}</em>
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/dashboard/items">{t.nav_items}</Link>
          <Link href="/dashboard">{t.nav_dashboard}</Link>
          <Link href="/dashboard/settings">{t.nav_settings}</Link>
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ThemeToggle />
          <LangToggle />
          {actions ?? <Link href="/dashboard/items/new" className="btn">{t.nav_new} <span className="arr">→</span></Link>}
        </div>
      </div>
    </header>
  );
}

/* ---------- dashboard chrome ---------- */
export function DashboardChrome({ email, children }: { email: string; children: React.ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const items = [
    { href: "/dashboard", label: t.nav_dashboard },
    { href: "/dashboard/items", label: t.nav_items },
    { href: "/dashboard/settings", label: t.nav_settings },
  ];
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const nav = (
    <>
      <Link href="/" className="snav-brand">
        <span style={{ fontWeight: 800, fontSize: 17 }}>{site.name}<em style={{ fontStyle: "normal", color: "var(--cobalt)" }}>{site.accent}</em></span>
        <span className="mono mut" style={{ fontSize: 10, marginInlineStart: "auto" }}>{t.nav_dashboard}</span>
      </Link>
      <nav className="snav-list" aria-label="Dashboard">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={`snav-link${isActive(it.href) ? " active" : ""}`} aria-current={isActive(it.href) ? "page" : undefined}>
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>
      <div className="snav-foot">
        <div className="mono mut" style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis" }} dir="ltr">{email}</div>
        <Link href="/" className="btn secondary" style={{ justifyContent: "center" }}>← Site</Link>
      </div>
    </>
  );
  return (
    <div className="dash-body">
      <aside className="dash-side" aria-label="Dashboard">{nav}</aside>
      <div className="dash-content">
        <header className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="btn ghost dash-drawer-btn" onClick={() => setOpen(true)} aria-label="menu" style={{ padding: 8 }}>
              <Menu size={20} />
            </button>
            <h1 className="dash-title">{items.find((it) => isActive(it.href))?.label ?? t.nav_dashboard}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            <LangToggle />
            <Link href="/dashboard/items/new" className="btn">+ {t.nav_new}</Link>
          </div>
        </header>
        <main id="main" className="dash-main">{children}</main>
      </div>
      <div className={`dash-drawer-wrap${open ? " open" : ""}`}>
        <div className="dash-drawer" role="dialog" aria-modal="true">
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px 0" }}>
            <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="close" style={{ padding: 8 }}>
              <X size={20} />
            </button>
          </div>
          {nav}
        </div>
        {open && <button type="button" aria-hidden="true" tabIndex={-1} className="scrim" onClick={() => setOpen(false)} />}
      </div>
    </div>
  );
}
