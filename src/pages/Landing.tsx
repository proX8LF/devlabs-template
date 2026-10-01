import { Link } from "react-router-dom";
import { SiteHeader, SectionLabel } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";

export default function Landing() {
  const { t } = useLang();
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="grid-bg" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <SectionLabel>{site.name} {site.accent} / 001</SectionLabel>
            <h1 className="display" style={{ fontSize: "clamp(3rem,7vw,6rem)" }}>{site.tagline}</h1>
            <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
              <Link to="/dashboard/items/new" className="btn">{t.nav_new} <span className="arr">→</span></Link>
              <Link to="/dashboard" className="btn secondary">{t.nav_dashboard}</Link>
            </div>
          </div>
        </section>
        <section style={{ background: "var(--cobalt)", color: "#fff" }}>
          <div className="wrap" style={{ paddingTop: 64, paddingBottom: 64 }}>
            <h2 className="display" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{t.empty_cta}.</h2>
            <Link to="/dashboard/items/new" className="btn secondary" style={{ marginTop: 24, borderColor: "#fff", color: "#fff" }}>
              {t.nav_new} <span className="arr">→</span>
            </Link>
          </div>
        </section>
      </main>
      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <span className="mono mut" style={{ fontSize: 11 }}>{site.footer}</span>
        </div>
      </footer>
    </>
  );
}
