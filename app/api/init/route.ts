import { NextResponse } from "next/server"
import db from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"

// POST /api/init - Initialize database (dev only)
export async function POST() {
  try {
    const schemaPath = join(process.cwd(), "scripts", "001-init-schema.sql")
    const schema = readFileSync(schemaPath, "utf-8")

    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of statements) {
      db.exec(statement)
    }

    // Create demo user
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run("demo_user_1", "demo@catform.astracat.ru", "Demo User", Date.now(), Date.now())

    return NextResponse.json({ success: true, message: "Database initialized" })
  } catch (error) {
    console.error("[v0] Error initializing database:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
