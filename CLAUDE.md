# CLAUDE.md

We're building the app described in [SPEC.md](./SPEC.md). 

Please, keep your replies concise and focused on the task. No unnecessary explanations or commentary. If you need to clarify something, ask a direct question. No long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands use **Bun** as the package manager and runtime.

```bash
# Run both apps concurrently (from root)
bun run dev

# Run individually
bun run --cwd apps/api dev     # API on http://localhost:3001
bun run --cwd apps/web dev     # Next.js frontend

# Build frontend
bun run --cwd apps/web build

# Lint frontend
bun run --cwd apps/web lint
```

Install dependencies from root: `bun install`

## Architecture

Monorepo with two apps under `apps/`:

- **`apps/api`** — Bun + Elysia REST API on port 3001, TypeORM with SQLite, better-auth for auth, Swagger docs auto-generated
- **`apps/web`** — Next.js 16 (App Router), React Query for server state, Tailwind + Mantine UI, D3.js charts

### Auth

Auth is handled entirely by **better-auth**. Do not define auth tables (user, session, account, verification) manually — they are managed by better-auth. Use `npx auth@latest generate` or `migrate` for schema changes.

The `user.id` is a **string** (not number) — all FK references to `userId` must use `string` type.

### Data Model

- `User` 1:N `Item`
- `User` 1:N `Category`
- `Category` 1:N `Item` (optional; null categoryId = "Uncategorized")
- `Item.score` is 1–5 (default 3); points only count when `completed = true`

### API Routes

- `/auth/*` — better-auth (no custom code)
- `/items` — CRUD + `PATCH /items/:id/toggle`
- `/categories` — CRUD
- Stats queries are SQL aggregates on the `item` table (see SPEC.md §6)

### Frontend Structure

```
apps/web/
  app/
    items/
    categories/
    dashboard/
  services/api.ts       # API client
  hooks/                # React Query hooks (useItems, useCategories)
  types/
```

React Query cache keys: `['items']`, `['items', categoryId]`, `['categories']`, `['stats', 'daily'|'monthly'|'category']`

### Database Indexes

The following indexes should exist on the `item` table: `userId`, `completed`, `createdAt`, `categoryId`.
