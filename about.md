# about.md — Agent Operating Manual for `devlabs-template`

> If you are an AI agent tasked with building on this repo: read this file FIRST,
> then `README.md`, then the file you were asked to change. Do not invent
> architecture — extend what exists.

## 1. What this is

A **customizable, ready-to-run SaaS starter**: Vite 7 + React 18 + React Router 6
+ TypeScript (strict) + Zod + lucide-react. No Next.js, no backend, no database
server, no auth provider — plain CSS design tokens, a localStorage store, and an
auth stub. It runs with `npm install && npm run dev` and deploys to Vercel as a
static SPA (rewrite to `/index.html` is already configured).

Primary language of the UI is English with **first-class Arabic/RTL**
(localStorage `tpl-lang`, `dir` on `<html>`, IBM Plex Sans Arabic, instant
switch with no reload). Theme is light/dark (localStorage `tpl-theme`, `dark`
class, pre-hydration script in `index.html` prevents flashing).

## 2. Project map

```
index.html                fonts, title, pre-hydration theme/dir script
src/main.tsx              React root + stylesheet
src/App.tsx               router (/, /dashboard/*) + RequireAuth guard
src/styles.css            THE design system (tokens + all component CSS)
src/pages/Landing.tsx     landing
src/pages/DashboardHome.tsx  CLP-style home: KPIs, attention, chart, status, storage, recent
src/pages/ItemsList.tsx / ItemNew.tsx / ItemDetail.tsx / SettingsPage.tsx / NotFound.tsx
src/components/ui.tsx     "use client"-free UI kit: primitives, header, dashboard chrome, toggles
src/lib/site.ts           brand config — rebrand here ONLY
src/lib/types.ts          domain types (Item, SiteSettings — extend here)
src/lib/validators.ts     zod schemas (client-validated; same schemas a server would use)
src/lib/db.ts             localStorage store + seed (swap point for a real API)
src/lib/auth.ts           auth stub (swap point; RequireAuth in App.tsx)
src/lib/i18n-dict.ts      EN + AR dictionaries (add EN key first, then AR mirror)
src/lib/i18n.tsx          LangProvider/useLang/useTheme + document application
```

## 3. Iron rules

1. **Tokens, not values.** Never hardcode colors/spacing — use `var(--cobalt)` etc.
   Sharp geometry: `border-radius: 0`, `1px solid var(--line)` borders, no shadows.
2. **Mono for system text.** IDs, dates, statuses, counts, buttons, labels use the
   `.mono` stack (`JetBrains Mono` + Arabic fallback). Body uses Inter / Plex Arabic.
3. **New UI goes in `src/components/ui.tsx`.** One client module, no new component
   files unless the file exceeds ~400 lines.
4. **No Next.js here — plain React Router.** Pages are components in
   `src/pages/`, routes live in `src/App.tsx`, links are `react-router-dom`
   (`to=`, `NavLink`, `useNavigate`, `useParams`). No SSR, no server components,
   no `next/*` imports — ever.
5. **Validate with zod on every write.** Same schemas a server would enforce;
   map `issue.path` to inline field errors. Never trust raw input.
6. **Keep `db.ts` function names stable.** Pages may only use its functions —
   this is what makes swapping in a real backend a 1-file job.
7. **No secrets in code or git.** `.env.example` documents, `.env*` is ignored.
   Tokens live in environment only, never in files, never in chat logs.

## 4. Recipes

**Rebrand:** `src/lib/site.ts` → colors/fonts in `src/styles.css` `:root`/`html.dark`.
**New page:** add `src/pages/<Name>.tsx` + route in `src/App.tsx` + sidebar link
in `ui.tsx` `NAV` + dict keys (EN then AR).
**New resource (copy `items`):** types → validators → `db.ts` methods →
list/new/detail pages + routes.
**Real backend:** re-implement the functions in `src/lib/db.ts` as async fetch
calls against your API; add loading/error states at call sites.
**Real auth:** `VITE_AUTH_ENFORCED=true`, implement session lookup in `auth.ts`
`getSession()`; `RequireAuth` in `App.tsx` already guards.

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

### 5.2 SPA / Vite notes (we left Next.js for these reasons)
- No SSR/prerender: `useSearchParams`-style build failures, `next/headers`
  client-boundary errors, and cookie-driven dynamic routes cannot happen here.
- Deep links need the SPA rewrite (`vercel.json` maps `/(.*)` → `/index.html`).
- Lang/theme apply instantly via context; the inline `index.html` script
  restores them pre-hydration to avoid flashing.
- Storage is `localStorage` (~5MB, JSON-serializable only). Quota/full errors
  are caught; Files/Blobs belong server-side when a backend is added.
- History: the v1 generation was Next.js — its hard lessons (server/client
  import splits, Suspense boundaries for search params, read-only Vercel FS
  with a memory overlay, `/_document` cache poisoning fixed by deleting
  `.next`) are kept in git history for reference if you ever go back.

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

1. `npm run typecheck` clean. 2. `npm run build` passes. 3. Preview server
   boots; every touched route renders; CRUD round-trips in a fresh profile.
4. AR (toggle) + dark (toggle) render correctly on touched pages. 5. No secrets
   added. 6. README/about updated if behavior changed.

## 7. Vite notes (why no Next.js here)

- No SSR/prerender: `useSearchParams`-style build failures cannot happen; route
  params come from `useParams()`.
- Deep links need the SPA rewrite (`vercel.json` already maps `/(.*)` to
  `/index.html`); without it, refresh on `/dashboard/items/x` 404s in production.
- Lang/theme apply instantly via context (no reload); the inline script in
  `index.html` restores them pre-hydration to avoid flashing.
- Storage is `localStorage` (~5MB): fine for a starter; quota errors are
  caught, content is JSON-serializable only (no Files/Blobs — store those
  server-side when you add a backend).
