# CLAUDE.md

We're building the app described in [SPEC.md](./SPEC.md). 

Please, keep your replies concise and focused on the task. No unnecessary explanations or commentary. If you need to clarify something, ask a direct question. No long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands use **pnpm** as the package manager.

```bash
# Run both apps concurrently (from root)
pnpm dev

# Run individually
pnpm --filter todo-list-api dev     # API on http://localhost:3001
pnpm --filter todo-list-web dev     # Next.js frontend

# Build frontend
pnpm --filter todo-list-web build

# Lint frontend
pnpm --filter todo-list-web lint
```

Install dependencies from root: `pnpm install`

## Architecture

Monorepo with three apps under `apps/`:

- **`apps/api`** — Legacy Bun + Elysia backend (do not use for new work)
- **`apps/api_node`** — Active Node.js + Elysia REST API on port 3001, TypeORM with SQLite, better-auth for auth, Swagger docs auto-generated
- **`apps/web`** — Next.js 16 (App Router), React Query for server state, Tailwind + Mantine UI, D3.js charts

### Auth

Auth is handled entirely by **better-auth**. Do not define auth tables (user, session, account, verification) manually — they are managed by better-auth. Use `npx auth@latest generate` or `migrate` for schema changes.

The `user.id` is a **string** (not number) — all FK references to `userId` must use `string` type.

### Data Model

- `User` 1:N `Item`
- `Item.priority` is 1–5 (default 3); 1=low, 5=high
- `Item.tags` is a comma-separated string (optional)
- `Item.featured` marks items pinned to the home page

### API Routes

- `/auth/*` — better-auth (no custom code)
- `/items` — CRUD; query params: `tags`, `priority`, `completed`, date range
- Analytics queries are SQL aggregates on the `item` table (see SPEC.md §6)

### Frontend Structure

```
apps/web/
  app/
    (home)/
    login/
    analytics/
  services/api.ts       # API client
  hooks/                # React Query hooks
  shared/utils.ts
  types/
```

React Query cache keys: `['items']`, `['stats', 'week'|'month'|'year']`

### Database Indexes

The following indexes should exist on the `item` table: `userId`, `completed`, `createdAt`.
