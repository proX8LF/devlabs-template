import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "./i18n-dict";

export * from "./i18n-dict";

export function getServerLang(): Lang {
  try {
    return cookies().get(LANG_COOKIE)?.value === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

export function getServerTheme(): "light" | "dark" {
  try {
    return cookies().get("tpl-theme")?.value === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
