import { Database } from 'bun:sqlite'
import { DataSource } from 'typeorm'
import { Item, Category } from './entities'

const DB_PATH = 'database.sqlite'

// Bun SQLite handle — used by better-auth
export const db = new Database(DB_PATH)
db.run('PRAGMA journal_mode = WAL;')

// TypeORM DataSource — used for app entities
export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: DB_PATH,
  synchronize: false,
  entities: [Item, Category],
})

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS category (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      userId    TEXT    NOT NULL,
      createdAt DATETIME DEFAULT (datetime('now'))
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS item (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      score       INTEGER NOT NULL DEFAULT 3,
      completed   INTEGER NOT NULL DEFAULT 0,
      deadline    TEXT,
      userId      TEXT    NOT NULL,
      categoryId  INTEGER,
      createdAt   DATETIME DEFAULT (datetime('now'))
    )
  `)

  db.run(`CREATE INDEX IF NOT EXISTS idx_item_user      ON item(userId)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_item_completed ON item(completed)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_item_createdAt ON item(createdAt)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_item_category  ON item(categoryId)`)
}

export async function initDb() {
  createSchema()
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }
}
