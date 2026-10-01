import { createContext, useContext, useEffect, useState } from "react";
import { LANG_COOKIE, THEME_COOKIE, getDict, type Dict, type Lang } from "./i18n-dict";

/* cookies kept for SSR-compat naming; SPA source of truth is localStorage */
function readLang(): Lang {
  try {
    return localStorage.getItem("tpl-lang") === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function readTheme(): "light" | "dark" {
  try {
    return localStorage.getItem("tpl-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyLang(lang: Lang): void {
  try {
    localStorage.setItem("tpl-lang", lang);
    document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000`;
  } catch { /* ignore */ }
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function applyTheme(theme: "light" | "dark"): void {
  try {
    localStorage.setItem("tpl-theme", theme);
    document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=31536000`;
  } catch { /* ignore */ }
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({
  lang: "en",
  t: getDict("en"),
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readLang());
  const setLang = (l: Lang) => {
    applyLang(l);
    setLangState(l);
  };
  useEffect(() => {
    applyLang(readLang());
    applyTheme(readTheme());
  }, []);
  return <Ctx.Provider value={{ lang, t: getDict(lang), setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export function useTheme(): ["light" | "dark", () => void] {
  const [theme, setTheme] = useState<"light" | "dark">(() => readTheme());
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };
  return [theme, toggle];
}
