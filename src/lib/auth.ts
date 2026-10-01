/**
 * Auth stub (SPA edition). Demo mode returns a fixed admin; set
 * AUTH_ENFORCED=true (Vite: VITE_AUTH_ENFORCED) and plug a real session
 * provider where marked. Guarded routes use <RequireAuth/> in App.tsx.
 */
export interface Session {
  userId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

const enforced = import.meta.env.VITE_AUTH_ENFORCED === "true";

export function getSession(): Session | null {
  if (!enforced) {
    return { userId: "demo-user", email: "demo@acme.example", role: "admin" };
  }
  try {
    const raw = localStorage.getItem("tpl-session");
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    return s.userId ? s : null;
  } catch {
    return null;
  }
}
