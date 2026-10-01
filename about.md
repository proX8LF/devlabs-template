# about.md — Agent Operating Manual for `devlabs-template`

> If you are an AI agent tasked with building on this repo: read this file FIRST,
> then `README.md`, then the file you were asked to change. Do not invent
> architecture — extend what exists.

## 1. What this is

A **customizable, ready-to-run SaaS starter**: Next.js 14 (App Router) + React 18 +
TypeScript (strict) + Zod + lucide-react. No Tailwind, no database server, no auth
provider — plain CSS design tokens, a file-backed JSON store, and an auth stub.
It runs with `npm install && npm run dev` and deploys to Vercel with zero config.

Primary language of the UI is English with **first-class Arabic/RTL** (cookie
`tpl-lang`, `dir` on `<html>`, IBM Plex Sans Arabic). Theme is light/dark
(cookie `tpl-theme`, `dark` class on `<html>`).

## 2. Project map

```
src/app/layout.tsx        root layout: lang/dir/theme from cookies, fonts, LangProvider
src/app/globals.css       THE design system (tokens + all component CSS)
src/app/page.tsx          landing
src/app/dashboard/layout.tsx   dashboard shell (sidebar + topbar + drawer)
src/app/dashboard/page.tsx     KPIs + recent + quick actions
src/app/dashboard/items/       list (client) / new (client) / [id] (client)
src/app/dashboard/settings/page.tsx  brand settings form
src/app/api/items/route.ts     GET list / POST create
src/app/api/items/[id]/route.ts GET / PATCH / DELETE
src/app/api/settings/route.ts  GET / PATCH
src/app/api/health/route.ts    GET liveness probe
src/components/ui.tsx      "use client": ALL UI (primitives, header, dashboard chrome, toggles)
src/lib/site.ts            brand config — rebrand here ONLY
src/lib/types.ts           domain types (Item, SiteSettings — extend here)
src/lib/validators.ts      zod schemas + fieldErrors()
src/lib/db.ts              JSON store + serverless memory overlay (swap point for Postgres)
src/lib/auth.ts            auth stub + requireSession() (swap point for Auth.js/Clerk)
src/lib/i18n-dict.ts       EN + AR dictionaries (add EN key first, then AR mirror)
src/lib/i18n.ts            getServerLang()/getServerTheme() (server only)
src/middleware.ts          route guard (active only when AUTH_ENFORCED=true)
data/                      runtime JSON (git-ignored; created on demand)
```

## 3. Iron rules

1. **Tokens, not values.** Never hardcode colors/spacing — use `var(--cobalt)` etc.
   Sharp geometry: `border-radius: 0`, `1px solid var(--line)` borders, no shadows.
2. **Mono for system text.** IDs, dates, statuses, counts, buttons, labels use the
   `.mono` stack (`JetBrains Mono` + Arabic fallback). Body uses Inter / Plex Arabic.
3. **New UI goes in `src/components/ui.tsx`.** One client module, no new component
   files unless the file exceeds ~400 lines.
4. **Server components stay server.** Anything importing `next/headers` must NEVER
   be imported (even transitively) by a `"use client"` module. Split dict/helpers
   (`i18n-dict.ts`) from server helpers (`i18n.ts`) — this exact split exists
   because violating it breaks the production build with a webpack error.
5. **Validate twice.** Zod in the API route (source of truth) + light client checks
   for UX. Never trust the client; return 422 with `{ fields }`.
6. **Keep `db.ts` signatures stable.** Pages and APIs may only use its functions —
   this is what makes swapping in Postgres a 1-file job.
7. **No secrets in code or git.** `.env.example` documents, `.env*` is ignored.
   Tokens live in environment only, never in files, never in chat logs.

## 4. Recipes

**Rebrand:** `src/lib/site.ts` → colors/fonts in `globals.css` `:root`/`html.dark`.
**New page:** add `src/app/dashboard/<name>/page.tsx` + sidebar link in `ui.tsx`
`DashboardChrome` + dict keys (EN then AR).
**New resource (copy `items`):** types → validators → `db.ts` methods →
`api/<name>/route.ts` + `[id]/route.ts` → list/new/`[id]` pages.
**New API:** validate with zod, `requireSession()` for writes, JSON errors only
(never stack traces), proper status codes (201/400/422/404).
**Real database:** re-implement the functions in `src/lib/db.ts`; keep names,
args and return shapes identical — nothing else changes.
**Real auth:** `AUTH_ENFORCED=true`, implement session lookup in `auth.ts`
`getSession()`; `middleware.ts` already guards `/dashboard/*` + mutating APIs.

## 5. Field notes — lessons from building the parent project

These are real bugs we hit and fixed. Treat them as checklists, not trivia.

### 5.1 RTL / Arabic (we broke this twice)
- Use **logical CSS only**: `margin-inline`, `padding-inline`, `inset-inline`,
  `border-inline`, `text-align: start/end`. Never `left/right/margin-left`.
- Arrows must mirror: `html[dir="rtl"] .arr { transform: scaleX(-1); }` and flip
  hover translations to match, or arrows point backwards in Arabic.
- Wrap step numbers, IDs and counters in `<bdi dir="ltr">` — otherwise bidi
  reorders `01 · label` strings.
- Text inputs that accept Arabic get `dir="auto"`; emails/phones/refs/IDs stay
  `dir="ltr"` — even inside RTL documents.
- **Wide `letter-spacing` breaks Arabic script joining.** Display headings use
  `-0.045em`; under `html[dir="rtl"]` reset display/tracking to `0` and raise
  `line-height` to ~1.8. Mono uppercase labels also drop to `0.02em` in RTL.
- Put IBM Plex Sans Arabic **second in every font stack**, including the mono
  stack — otherwise Arabic falls back to a system font and looks foreign.
- Arabic plural/grammar: prefer neutral dashboard shorthand (`3 مسودة`)
  over grammatically exact forms; verify with a native reader before launch.
- Always verify Arabic by fetching pages with the lang cookie set and grepping
  for expected strings AND for leaked English chrome.

### 5.2 Next.js App Router boundaries
- `next/headers` (`cookies()`) = server only. A client component importing it —
  even 3 hops away — fails the build. Keep a `-dict` (pure) vs server-helper
  split for every shared module.
- `useSearchParams()` in a statically prerendered page **requires a
  `<Suspense>` boundary** or the build fails at "Collecting page data".
  Wrap it even when you believe the page is dynamic.
- `cookies()` in the root layout makes **every route dynamic** — accept it for
  cookie-driven lang/theme, or move to client-side theming.
- Server actions / route handlers: return `{ error }` JSON + status codes;
  an empty 500 body surfaces on the client as `JSON.parse: unexpected end of
  data` — parse defensively and include status + body snippet in the message.

### 5.3 Vercel / serverless
- The filesystem is **read-only** (except `/tmp`). This template's `db.ts`
  has a write-through memory overlay so writes don't crash — but data is
  per-instance/ephemeral. Production persistence = Postgres/Blob behind the
  same `db.ts` signatures.
- First deploy needs `vercel.json` with `{"framework":"nextjs"}` or the CLI may
  misdetect the output directory ("No Output Directory named public").
- Set `NEXT_PUBLIC_APP_URL` to the production URL after first deploy, then
  redeploy — share links and absolute URLs bake in at build time.
- Cold starts + heavy server work (PDF/Chromium) can hit Hobby 60s limits:
  set `export const maxDuration = 60` explicitly and fail with clean JSON.

### 5.4 Files, uploads, validation (for when you add them)
- Validate server-side: allowlist MIME (not extension), size cap, min/max
  dimensions, and re-encode (sharp) so stored bytes are what you expect.
- Wrap sharp/metadata calls in try/catch → 400 JSON, never a 500 HTML page.
- Serve stored files through an `api/files/[...path]` route with explicit
  content types; strip `..` from paths.

### 5.5 Windows / PowerShell 5.1 field notes
- No `&&`, no `-Form`/`-SkipHttpErrorCheck` on `Invoke-WebRequest`, no
  `Select-Object -Match`. Chain with `;` and `if ($?)`.
- `npm` is a `.cmd` shim: `Start-Process npm` fails — use `cmd /c npm …`.
- Background jobs don't survive between shells — launch servers via
  `Start-Process cmd /c …` (detached), find clashes with
  `Get-NetTCPConnection -LocalPort <p>`, never kill another agent's server.
- `sharp`/native modules: approve install scripts or verify `require()` works.
- If a build fails once with `PageNotFoundError: /_document`, delete `.next`
  and rebuild — stale cache poisoning is real on Windows.

### 5.6 Workflow discipline
- Typecheck → tests → build → run → verify routes → THEN deploy. Never deploy
  what you didn't run locally.
- Verify with real HTTP: status codes, JSON shapes, Arabic strings with cookie,
  dark `class`, file downloads (magic bytes, e.g. `%PDF-`).
- One concern per commit; never bundle refactors with features.
- When the user pastes a secret/token: use it once from an env var, never
  write it to disk, and tell them to **revoke it immediately** — it's compromised.

## 6. Definition of done (for any agent task on this repo)

1. `npm run typecheck` clean. 2. `npm run lint` no errors. 3. `npm run build`
   passes. 4. Dev server boots; every touched route returns 200; every touched
   API returns the documented shape. 5. AR (cookie) + dark (cookie) render
   correctly on touched pages. 6. No secrets added. 7. README/about updated if
   behavior changed.
