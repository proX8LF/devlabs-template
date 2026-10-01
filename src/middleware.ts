import { NextRequest, NextResponse } from "next/server";

/** Auth-ready route guard. Demo mode passes through (see src/lib/auth.ts). */
export function middleware(req: NextRequest) {
  if (process.env.AUTH_ENFORCED === "true") {
    const session = req.cookies.get("session")?.value;
    const guarded = req.nextUrl.pathname.startsWith("/dashboard") || (req.nextUrl.pathname.startsWith("/api/") && req.method !== "GET");
    if (guarded && !session) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/api/:path*"] };
