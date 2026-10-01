# DevLabs Template

Customizable SaaS starter. **Vite + React + TypeScript** + EN/AR + dark mode + dashboard shell + local-first store. No Next.js, no backend to run.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

## What's inside

- `/` — landing (hero, CTA, footer)
- `/dashboard` — CLP-style home: KPI strip, attention queue, 14-day chart, status breakdown, storage meter, recent
- `/dashboard/items` — search / filter / list with empty state
- `/dashboard/items/new` — validated create form (zod)
- `/dashboard/items/:id` — details, status toggle, duplicate, delete
- `/dashboard/settings` — brand settings form (localStorage API)

Storage is **local-first** (`localStorage`, seeded on first run). Point `src/lib/db.ts`
at a real API later — pages only use its functions.

## Make it yours

1. Rebrand: `src/lib/site.ts` (name, accent, email, footer).
2. Tokens: `:root` / `html.dark` in `src/styles.css`.
3. Language: add keys in `src/lib/i18n-dict.ts` (EN first, AR mirror) — no reload needed.
4. New resource: copy the `db` methods + an `ItemsList`-style page + routes in `src/App.tsx`.
5. Real backend: re-implement `src/lib/db.ts` against fetch; add loading states.
6. Real auth: `VITE_AUTH_ENFORCED=true`, implement session in `src/lib/auth.ts` (`RequireAuth` already guards).

## Checks / deploy

```bash
npm run typecheck && npm run build
vercel --prod
```

Read `about.md` before changing anything — agent operating manual inside.
