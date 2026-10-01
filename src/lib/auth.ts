import { cookies } from "next/headers";

/**
 * Auth stub. Demo mode returns a fixed admin; set AUTH_ENFORCED=true and plug
 * a real session provider (Auth.js / Clerk / custom) where marked.
 */
export interface Session {
  userId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

export function getSession(): Session | null {
  if (process.env.AUTH_ENFORCED !== "true") {
    return { userId: "demo-user", email: "demo@acme.example", role: "admin" };
  }
  const jar = cookies();
  const token = jar.get("session")?.value;
  if (!token || token.length < 16) return null;
  return { userId: "session-user", email: "user@acme.example", role: "editor" };
}

export function requireSession(): Session {
  const s = getSession();
  if (!s) {
    const e = new Error("Unauthorized") as Error & { status?: number };
    e.status = 401;
    throw e;
  }
  return s;
}
