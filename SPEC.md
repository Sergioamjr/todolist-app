# Technical Specification — Gamified To-Do App (MVP)

## 1. Repository Structure

This project is organized as a **monorepo** with two packages:

```
/
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # Bun backend
├── package.json    # Root workspace config
└── spec.md
```

---

## 2. Architecture Overview

### Frontend (`apps/web`)

| Concern     | Choice                     |
|-------------|----------------------------|
| Framework   | Next.js (App Router)       |
| Language    | TypeScript                 |
| State/Data  | React Query                |
| UI          | Tailwind + Mantine UI      |
| Charts      | D3.js                      |

### Backend (`apps/api`)

| Concern   | Choice        |
|-----------|---------------|
| Runtime   | Bun           |
| Framework | Elysia        |
| ORM       | TypeORM       |
| Docs      | Swagger       |
| Auth      | better-auth   |
| DB        | SQLite        |

> The UI, animations, and theme will be provided later.

---

## 3. Core Concepts

### Relationships

- `User` 1:N `Item`
- `User` 1:N `Category`
- `Category` 1:N `Item`

---

## 4. Database Schema (TypeORM)

### Auth Tables (managed by better-auth)

better-auth manages its own tables. Do **not** define these manually — use `npx auth@latest generate` or `migrate`.

#### `user`

| Column          | Type    | Notes                        |
|-----------------|---------|------------------------------|
| id              | string  | Primary key                  |
| name            | string  | Display name                 |
| email           | string  | Unique                       |
| emailVerified   | boolean |                              |
| image           | string  | Optional                     |
| createdAt       | Date    |                              |
| updatedAt       | Date    |                              |

> `firstName` and `lastName` can be added as `additionalFields` in the better-auth config and split from `name` via a `databaseHooks.user.create.before` hook.

#### `session`

| Column      | Type   | Notes           |
|-------------|--------|-----------------|
| id          | string | Primary key     |
| userId      | string | FK → user       |
| token       | string | Unique          |
| expiresAt   | Date   |                 |
| ipAddress   | string | Optional        |
| userAgent   | string | Optional        |
| createdAt   | Date   |                 |
| updatedAt   | Date   |                 |

#### `account`

| Column                 | Type   | Notes           |
|------------------------|--------|-----------------|
| id                     | string | Primary key     |
| userId                 | string | FK → user       |
| accountId              | string |                 |
| providerId             | string |                 |
| accessToken            | string | Optional        |
| refreshToken           | string | Optional        |
| accessTokenExpiresAt   | Date   | Optional        |
| refreshTokenExpiresAt  | Date   | Optional        |
| scope                  | string | Optional        |
| idToken                | string | Optional        |
| password               | string | Optional        |
| createdAt              | Date   |                 |
| updatedAt              | Date   |                 |

#### `verification`

| Column      | Type   | Notes       |
|-------------|--------|-------------|
| id          | string | Primary key |
| identifier  | string |             |
| value       | string |             |
| expiresAt   | Date   |             |
| createdAt   | Date   |             |
| updatedAt   | Date   |             |

---

### App Tables

#### `Item`

```typescript
@Entity()
class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 3 })
  score: number; // 1–5

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true, type: 'date' })
  deadline: Date;

  @Column()
  userId: string; // FK → user.id (string, per better-auth)

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### `Category`

```typescript
@Entity()
class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userId: string; // FK → user.id (string, per better-auth)

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 5. API Design (REST)

### Auth

Handled by **better-auth** — no custom spec needed.

### Items

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/items?categoryId=`   | Get items (optional filter) |
| POST   | `/items`               | Create item              |
| PUT    | `/items/:id`           | Update item              |
| DELETE | `/items/:id`           | Delete item              |
| PATCH  | `/items/:id/toggle`    | Toggle completed         |

**POST/PUT body:**
```json
{
  "name": "string",
  "description": "string",
  "score": 3,
  "deadline": "YYYY-MM-DD",
  "categoryId": 1
}
```

**PATCH toggle body:**
```json
{ "completed": true }
```

### Categories

| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| GET    | `/categories`      | List categories |
| POST   | `/categories`      | Create category |
| PUT    | `/categories/:id`  | Update category |
| DELETE | `/categories/:id`  | Delete category |

---

## 6. Charts & Analytics

> All charts are based on current state only — no history is tracked.

**Base rule:** only items where `completed = true`.

### Points per Day
```sql
SELECT DATE(createdAt) AS date, SUM(score) AS points
FROM item
WHERE completed = true AND userId = ?
GROUP BY date;
```

### Points per Month
```sql
SELECT strftime('%Y-%m', createdAt) AS month, SUM(score) AS points
FROM item
WHERE completed = true AND userId = ?
GROUP BY month;
```

### Points per Category
```sql
SELECT COALESCE(c.name, 'Uncategorized') AS category, SUM(i.score) AS points
FROM item i
LEFT JOIN category c ON i.categoryId = c.id
WHERE i.completed = true AND i.userId = ?
GROUP BY category;
```

> If `categoryId = null`, items are grouped as **"Uncategorized"**.

### Completed vs Pending
```sql
SELECT
  SUM(CASE WHEN completed = true THEN 1 ELSE 0 END)  AS completed,
  SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) AS pending
FROM item
WHERE userId = ?;
```

---

## 7. Frontend Structure (`apps/web`)

### Folder Layout

```
/app
  /items
  /categories
  /dashboard

/services
  api.ts

/hooks
  useItems.ts
  useCategories.ts

/types
```

### React Query Keys

| Key                        | Description          |
|----------------------------|----------------------|
| `['items']`                | All Items            |
| `['items', categoryId]`    | Items per category   |
| `['categories']`           | All categories       |
| `['stats', 'daily']`       | Daily points         |
| `['stats', 'monthly']`     | Monthly points       |
| `['stats', 'category']`    | Points per category  |

### Mutations

- `createItem` / `updateItem` / `deleteItem` / `toggleItem`
- `createCategory` / `updateCategory` / `deleteCategory`

---

## 8. Business Rules

- **Score:** 1–5, default = 3. Points counted only when `completed = true`.
- **Category:** Optional. If `null`, items are grouped by date in charts.
- **Items:** can be edited or toggled at any time.
- **Charts:** reflect current state only (no historical snapshots).

---

## 9. Indexing

```sql
CREATE INDEX idx_item_user      ON item(userId);
CREATE INDEX idx_item_completed ON item(completed);
CREATE INDEX idx_item_createdAt ON item(createdAt);
CREATE INDEX idx_item_category  ON item(categoryId);
```
