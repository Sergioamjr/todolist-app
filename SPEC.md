# Technical Specification — To-Do App (MVP)

## 1. Repository Structure

This project is organized as a **monorepo** with three packages:

```
/
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # Bun backend (legacy code)
│   └── api_node/   # Node.js backend
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
| Kubb        | Requests Management        |
| UI          | Tailwind/Mantine           |
| Charts      | D3.js                      |
| Rich Text   | React-Quill                |
| Testing     | Jest/React Testing Library |
| E2E         | Playwright                 |

### Backend (`apps/api`) (legacy)

| Concern   | Choice        |
|-----------|---------------|
| Runtime   | Bun           |
| Framework | Elysia        |
| ORM       | TypeORM       |
| Docs      | Swagger       |
| Auth      | better-auth   |
| DB        | SQLite        |

### Backend (`apps/api`)

| Concern   | Choice        |
|-----------|---------------|
| Runtime   | Node          |
| Framework | Elysia        |
| ORM       | TypeORM       |
| Docs      | Swagger       |
| Auth      | better-auth   |
| DB        | SQLite        |
| Testing   | Jest/Supertest|

Reasoning: there's a bug on vercel when using bun (https://community.vercel.com/t/bun-runtime-requested-module-is-not-instantiated-yet/26380/5). Investigating and debugging is taking too long, so we'll switch to node for the backend.

---

## 3. Core Concepts

### Relationships

- `User` 1:N `Item`

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
  description: string; // rich text, optional
  
  @Column({ nullable: true })
  tags: string; // comma-separated, optional

  @Column({ default: 3 })
  priority: number; // 1–5

  @Column({ default: false })
  completed: boolean; 

  @Column({ default: false })
  featured: boolean;

  @Column()
  userId: string; // FK → user.id (string, per better-auth)

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

**POST/PUT body:**
```json
{
  "name": "string",
  "description": "string",
  "priority": 3,
  "completed": false,
  "featured": false
}
```

**PATCH toggle body:**
```json
{ "completed": true }
```

---

## 6. Charts & Analytics

It will be possible to analyze the statuses of the items per week, month and year, filtering them by completed, tags and priority. The parameters will be passed in the query.

---

## 7. Frontend Structure (`apps/web`)

### Folder Layout

```
/app
  / (home page)
  /login
  /analytics

/services
  api.ts
  
/shared
  utils.ts

/hooks
  (kub hooks go here too, e.g. useCreateItem.ts)

/types
```

---

## 8. Business Rules

- **Priority:** 1–5, being 1: low, 2: medium-low, 3: medium, 4: medium-high, 5: high.
- **Items:** can be edited or deleted at any time.
- **Authentication:** users must be authenticated to access any item-related endpoints. Each user can only access their own items.
- **Tags:** are optional and stored as a comma-separated string. They can be used for filtering and analytics. They can be added, removed, or edited at any time. All tags will be stored in the database. There will be an endpoint to get all unique tags for a user, which can be used for new items or filtering.
- **Featured Items:** can be marked as featured, which will show them in the home page and allow filtering by this status.
- **Analytics:** users can analyze their items based on completion status, tags, and priority over different time periods (week, month, year).
- **Rich Text Description:** the description field supports rich text formatting, allowing users to add styled content to their items.
- **login:** users can log in using email and password, and optionally with third-party providers (e.g., Google) configured in better-auth. The login page will have a form for email and password, and buttons for third-party providers. Upon successful login, users will be redirected to the home page where they can manage their items. There will be a button the reset password, which will trigger the better-auth password reset flow.
- **Session Management:** sessions will be managed by better-auth, which will handle token generation, expiration, and storage. The frontend will use cookies to maintain the session and include the token in API requests for authentication.
- **Error Handling:** the API will return appropriate HTTP status codes and error messages for different scenarios (e.g., 400 for bad requests, 401 for unauthorized access, 404 for not found). The frontend will display user-friendly error messages based on the API responses.
- **home page**: the home page will display a list of items, with options to filter by tags, priority, and completion status. Featured items will be highlighted at the top. Users can click on an item to edit it or mark it as completed directly from the list. There will also be a button to create a new item, which will open a form for entering the item details (name, description, tags, priority) in a modal. There will be a dropdown to filter the view by day (default), week, month, and year, which will adjust the items shown based on their creation date. featured items will always be shown regardless of the date filter.
---

## Endpoints
There will be endpoints to manage the items (CRUD operations):
- `GET /items`: Get a list of items, with optional query parameters for filtering by tags, priority, completion status, and date range.
- `POST /items`: Create a new item with the provided details (name, description, tags, completed, featured, priority).
- `PUT /items/:id`: Update an existing item by its ID, allowing changes to any of its fields (name, description, tags, priority, featured, completion status).
- `DELETE /items/:id`: Delete an item by its ID.

## Development flow
- Create unit and integration tests for the frontend and backend using Jest and React Testing Library for the frontend and Jest with Supertest for the backend before any implementation.
- After the implementation, run the tests to ensure everything continues working as expected.
- Deploy the application to Vercel, ensuring that the backend is properly configured to run on Node.js instead of Bun due to the mentioned bug. Monitor the deployment for any issues and fix them as needed.
- Follow these steps: write tests -> implementation/fix bugs -> run tests -> deploy -> monitor/fix
