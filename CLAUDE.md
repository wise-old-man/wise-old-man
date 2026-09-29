# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo for the Wise Old Man — an Old School RuneScape progress tracker. Each component has its own
`package.json`, `eslint.config.mjs`, and independent build/deploy pipeline. There is **no root workspace
tooling** (root `package.json` only holds `prettier`). Always `cd` into the component you're working on.

- **`server/`** — Backend & REST API. Node.js + TypeScript, Express, Prisma (PostgreSQL), Redis, BullMQ, Jest.
- **`app/`** — Web app. Next.js 14 (App Router), TailwindCSS, HeadlessUI, RadixUI, React Query.
- **`client-js/`** — Published npm client `@wise-old-man/utils` (`WOMClient`). Rollup build.
- **`docs/`** — API documentation (Docusaurus).

## Commands

Run these from inside the relevant component directory.

**Server** (`cd server`):
- `npm run dev` — Starts Docker deps (Postgres/Redis/PGAdmin), resets the dev DB, hot-reloads via ts-node-dev. Requires Docker running. API at `http://localhost:5000`.
- `npm run build` — `prisma generate` + `tsc`.
- `npm run lint` — ESLint.
- `npm run test` — Runs all unit + integration tests (spins up Docker + resets a `_TEST` database).
- `npm run test <name>` — Runs both unit and integration files matching `<name>` (e.g. `npm run test players`).
- `npm run test <name> u` — Single **unit** file only (skips Docker/DB setup — fast).
- `npm run test <name> i` — Single **integration** file only.
- Tests live in `server/__tests__/suites/{unit,integration}/<name>.test.ts`. The `test <name>` script matches by that filename.

**App** (`cd app`): `npm run dev` (port 3000), `npm run build`, `npm run lint`.

**Client-js** (`cd client-js`): `npm run build` (regenerates Prisma in server first, then Rollup), `npm run lint`.

CI runs per-component lint/test/version-check workflows on PRs to `master`, scoped by changed paths
(`.github/workflows/`). Note `app-deploy.yml` also triggers on changes to
`server/src/api/modules/efficiency/**` — efficiency (EHP/EHB) logic is shared into the app build.

## Server architecture

Request flow: **Router → Service → Prisma**. There is no ORM-model or controller layer beyond this.

- **Modules** (`server/src/api/modules/<domain>/`) group everything for a domain: achievements,
  competitions, deltas, efficiency, general, groups, name-changes, patrons, players, records, snapshots.
  Each has a `<domain>.router.ts`, `<domain>.utils.ts`, and a `services/` directory.
- **Routers** define endpoints with `validateRequest({ query/params/body: zod })` for validation and
  wrap handlers in `executeRequest(...)` (see `api/util/routing.ts`). Routers are registered in
  `api/routing.ts`. Responses are shaped by formatters in `api/responses.ts` (e.g. `formatPlayerResponse`).
- **Services** are single-purpose files, one exported function or a `PascalCase` service (e.g.
  `SearchPlayersService.ts`, `UpdatePlayerService.ts`). Business logic lives here, not in routers.
- Entry points in `server/src/entrypoints/`: `dev.server.ts` (dev — API + jobs in one process),
  `api.server.ts`, `job-runner.server.ts`, `bull-board.server.ts`. `SERVER_TYPE` env var selects role;
  required env vars per type are enforced in `server/src/env.ts`.

### Background jobs (BullMQ + Redis)

- Handlers in `server/src/jobs/handlers/*.job.ts` implement the `JobHandler<Payload>` type (`options`,
  `generateUniqueJobId`, `execute`). Every handler must be registered in `jobs/jobs.config.ts`.
- Managed by `jobs/job-manager.ts`. `Schedule*` jobs enqueue work on cron; `Sync*`/`Update*`/`Dispatch*`
  jobs do the work. Discord notifications are dispatched via jobs. Handlers commonly early-return when
  `process.env.NODE_ENV === 'test'`.

### Prisma & types conventions

- **Never import from `@prisma/client` directly** — ESLint (`no-restricted-imports`) forbids it. Import
  models/enums from `server/src/types` instead. The shared Prisma client is `server/src/prisma/index.ts`,
  which extends the client to convert `BigInt`/computed-metric values (computed metrics like EHP/EHB are
  stored scaled by 10,000 and divided back out on read). Import it as `prisma` from `../../../../prisma`.
- Schema and migrations: `server/prisma/schema.prisma`, `server/prisma/migrations/`.

### Shared code

`server/src/utils/shared/` holds framework-agnostic domain logic (metric/period/country/experience
helpers, enums). **`client-js` re-exports this directory directly** (`export * from '../../server/src/utils/shared'`),
so it ships to the published npm package and the web app. Changes here affect the API, the client, and
the app — treat it as a public contract.

## App architecture

- Next.js App Router under `app/src/app/`. Server code talks to the API through
  `app/src/services/wiseoldman.ts`; server actions live in `app/src/actions/`.
- By default the app points at the **production API** (`https://api.wiseoldman.net`). To use a local
  server, uncomment `NEXT_PUBLIC_BASE_API_URL` in `.env.local`.
- Components in `app/src/components/` (PascalCase `.tsx`). Uses RadixUI/HeadlessUI primitives, Tailwind,
  `class-variance-authority`, React Query, and Recharts.

## Conventions

- Prettier + ESLint are enforced (`prettier/prettier: error`). Run the component's `lint` before committing.
- Server utility files use kebab-case with a `.util.ts` / `.utils.ts` suffix; services use PascalCase.
- On Windows, if dev scripts fail with `bash\r: No such file or directory`, run `git config core.autocrlf false`.
