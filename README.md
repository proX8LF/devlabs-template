# DevLabs Template

Customizable SaaS starter. Next.js 14 + TypeScript + EN/AR + dark mode + dashboard shell + JSON store.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

## What's inside

- `/` — landing (hero, CTA, footer)
- `/dashboard` — KPIs, recent items, quick actions
- `/dashboard/items` — search / filter / list with empty state
- `/dashboard/items/new` — validated create form
- `/dashboard/items/[id]` — details, status toggle, duplicate, delete
- `/dashboard/settings` — brand settings form (live API)
- `GET/POST /api/items` · `GET/PATCH/DELETE /api/items/:id`
- `GET/PATCH /api/settings` · `GET /api/health`

## Make it yours

1. Rebrand: edit `src/lib/site.ts` (name, accent, email, footer).
2. Tokens: edit `:root` / `html.dark` in `src/app/globals.css`.
3. Language: add keys in `src/lib/i18n-dict.ts` (EN object first, mirror in AR).
4. New resource: copy `items` (pages + `api/items` + `lib` types/validators/db methods).
5. Real database: re-implement `src/lib/db.ts` (same function signatures, APIs untouched).
6. Real auth: set `AUTH_ENFORCED=true`, plug a session provider into `src/lib/auth.ts`.

## Checks / deploy

```bash
npm run typecheck && npm run lint && npm run build
vercel --prod
```

Read `about.md` before changing anything — it holds the agent operating manual.
