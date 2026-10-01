import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useLang, useTheme } from "@/lib/i18n";
import { site } from "@/lib/site";

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
  return <span className="badge"><i style={{ background: color }} />{label ?? status}</span>;
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

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button" className="btn ghost mono" style={{ border: "1px solid var(--line)", padding: "8px 14px" }}
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      aria-label="language"
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button" className="btn ghost" style={{ border: "1px solid var(--line)", padding: "8px 12px" }}
      onClick={toggle} aria-label="theme"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ---------- site header ---------- */
export function SiteHeader({ actions }: { actions?: React.ReactNode }) {
  const { t } = useLang();
  return (
    <header className="site-header">
      <div className="header-frame">
        <Link to="/" className="brandlock" aria-label="home">
          {site.name}<br /><em>{site.accent}</em>
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link to="/dashboard/items">{t.nav_items}</Link>
          <Link to="/dashboard">{t.nav_dashboard}</Link>
          <Link to="/dashboard/settings">{t.nav_settings}</Link>
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ThemeToggle />
          <LangToggle />
          {actions ?? <Link to="/dashboard/items/new" className="btn">{t.nav_new} <span className="arr">→</span></Link>}
        </div>
      </div>
    </header>
  );
}

/* ---------- dashboard chrome ---------- */
const NAV = [
  { to: "/dashboard", label: "nav_dashboard" as const, end: true },
  { to: "/dashboard/items", label: "nav_items" as const, end: false },
  { to: "/dashboard/settings", label: "nav_settings" as const, end: false },
];

export function DashboardChrome({ email, children }: { email: string; children: React.ReactNode }) {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  const activeLabel = [...NAV].reverse().find((it) => (it.end ? location.pathname === it.to : location.pathname === it.to || location.pathname.startsWith(`${it.to}/`)));
  const nav = (
    <>
      <Link to="/" className="snav-brand">
        <span style={{ fontWeight: 800, fontSize: 17 }}>{site.name}<em style={{ fontStyle: "normal", color: "var(--cobalt)" }}>{site.accent}</em></span>
        <span className="mono mut" style={{ fontSize: 10, marginInlineStart: "auto" }}>{t.nav_dashboard}</span>
      </Link>
      <nav className="snav-list" aria-label="Dashboard">
        {NAV.map((it) => (
          <NavLink
            key={it.to} to={it.to} end={it.end}
            className={({ isActive }) => `snav-link${isActive ? " active" : ""}`}
          >
            {t[it.label]}
          </NavLink>
        ))}
      </nav>
      <div className="snav-foot">
        <div className="mono mut" style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis" }} dir="ltr">{email}</div>
        <Link to="/" className="btn secondary" style={{ justifyContent: "center" }}>← Site</Link>
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
            <h1 className="dash-title">{activeLabel ? t[activeLabel.label] : t.nav_dashboard}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            <LangToggle />
            <button type="button" className="btn" onClick={() => navigate("/dashboard/items/new")}>+ {t.nav_new}</button>
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

export function GhostButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={`btn ghost ${props.className ?? ""}`} />;
}
