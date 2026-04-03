import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.DB_URL ?? '',
  authToken: process.env.DB_AUTH_TOKEN,
})

async function createSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id            TEXT    PRIMARY KEY,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image         TEXT,
      createdAt     INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updatedAt     INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS session (
      id          TEXT    PRIMARY KEY,
      expiresAt   INTEGER NOT NULL,
      token       TEXT    NOT NULL UNIQUE,
      createdAt   INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updatedAt   INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      ipAddress   TEXT,
      userAgent   TEXT,
      userId      TEXT    NOT NULL REFERENCES user(id) ON DELETE CASCADE
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId)`)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS account (
      id                     TEXT PRIMARY KEY,
      accountId              TEXT NOT NULL,
      providerId             TEXT NOT NULL,
      userId                 TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      accessToken            TEXT,
      refreshToken           TEXT,
      idToken                TEXT,
      accessTokenExpiresAt   INTEGER,
      refreshTokenExpiresAt  INTEGER,
      scope                  TEXT,
      password               TEXT,
      createdAt              INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updatedAt              INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId)`)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS verification (
      id          TEXT    PRIMARY KEY,
      identifier  TEXT    NOT NULL,
      value       TEXT    NOT NULL,
      expiresAt   INTEGER NOT NULL,
      createdAt   INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updatedAt   INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier)`)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS category (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      userId    TEXT    NOT NULL,
      createdAt DATETIME DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS item (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      score       INTEGER NOT NULL DEFAULT 3,
      completed   INTEGER NOT NULL DEFAULT 0,
      deadline    TEXT,
      forDate     TEXT    NOT NULL DEFAULT (date('now')),
      userId      TEXT    NOT NULL,
      categoryId  INTEGER,
      createdAt   DATETIME DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_user      ON item(userId)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_completed ON item(completed)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_createdAt ON item(createdAt)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_item_category  ON item(categoryId)`)

  // Migrations for existing databases
  const columns = await db.execute(`PRAGMA table_info(item)`)
  const hasForDate = columns.rows.some((r) => r[1] === 'forDate')
  if (!hasForDate) {
    await db.execute(`ALTER TABLE item ADD COLUMN forDate TEXT`)
    await db.execute(`UPDATE item SET forDate = date(createdAt) WHERE forDate IS NULL`)
  }
}

export async function initDb() {
  await createSchema()
}
