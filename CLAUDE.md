# Insurance & Estates — PM Dashboard

Internal project management + social media planning dashboard for insuranceandestates.com.

## Stack

- Next.js 15.5 App Router, React 19, TypeScript
- Tailwind + shadcn/ui-style primitives
- Neon Postgres via `@neondatabase/serverless` (HTTP driver) + Drizzle ORM
- Server Actions for all mutations
- Auth: currently disabled (stubbed in `stack.ts`). Stage 2 will be Better Auth (Neon Auth backend).

## Git workflow

- **Always push to `main`.** This repo deploys directly from `main` to Vercel — there's no PR flow. Don't create feature branches; commit and push to `main`.
- Don't open PRs unless explicitly asked.

## Env vars

Set in Vercel via the Neon integration:
- `DATABASE_URL` (and the rest of `POSTGRES_*` / `PGHOST` / etc. — auto-injected)
- `NEON_AUTH_BASE_URL` — exists but not consumed yet (will be once Better Auth is wired)

There are no Stack Auth keys; Neon migrated to Better Auth, which is why the original `@stackframe/stack` integration was abandoned.

## Auth status

Auth is intentionally disabled while the rest of the dashboard is being verified.

- `stack.ts` exports a hardcoded `getCurrentUser()` returning `{ primaryEmail: "owner@example.com" }`.
- `app/(app)/layout.tsx` skips the auth check.
- `/`, `/login`, `/handler/[...stack]` all redirect to `/dashboard`.
- The `allowed_emails` table is seeded but unused right now.

**The deployed site is wide-open.** Don't share the preview URL publicly until Stage 2 (Better Auth) lands.

## Database

Schema lives in `lib/db/schema.ts`. To bootstrap Neon: paste `drizzle/setup.sql` into the Neon SQL Editor — it's idempotent.
