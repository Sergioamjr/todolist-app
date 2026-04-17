import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.DB_URL ?? '',
  authToken: process.env.DB_AUTH_TOKEN,
})

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS item (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      tags        TEXT,
      priority    INTEGER NOT NULL DEFAULT 3,
      completed   INTEGER NOT NULL DEFAULT 0,
      featured    INTEGER NOT NULL DEFAULT 0,
      userId      TEXT NOT NULL,
      createdAt   DATETIME DEFAULT (datetime('now'))
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_userId    ON item(userId)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_completed ON item(completed)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_createdAt ON item(createdAt)`)
}
