import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LANG_COOKIE, THEME_COOKIE } from "@/lib/i18n-dict";
import { LangProvider } from "@/components/ui";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} ${site.accent} — ${site.tagline}`,
  description: site.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let lang: "en" | "ar" = "en";
  let theme = "light";
  try {
    const jar = cookies();
    if (jar.get(LANG_COOKIE)?.value === "ar") lang = "ar";
    if (jar.get(THEME_COOKIE)?.value === "dark") theme = "dark";
  } catch { /* ignore */ }
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={theme === "dark" ? "dark" : undefined}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip" href="#main">Skip</a>
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
