import Database from "better-sqlite3"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"

// Ensure data directory exists
const dataDir = join(process.cwd(), "data")
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

// Initialize SQLite database
const dbPath = join(dataDir, "catform.db")
const db = new Database(dbPath, { create: true })

// Enable WAL mode for better concurrent access
db.exec("PRAGMA journal_mode = WAL")
db.exec("PRAGMA foreign_keys = ON")

export default db
