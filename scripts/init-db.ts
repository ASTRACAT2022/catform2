import db from "../lib/db"
import { readFileSync } from "fs"
import { join } from "path"

console.log("Initializing CAT FORM database...")

// Read and execute schema
const schemaPath = join(process.cwd(), "scripts", "001-init-schema.sql")
const schema = readFileSync(schemaPath, "utf-8")

// Split by semicolon and execute each statement
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

for (const statement of statements) {
  try {
    db.exec(statement)
    console.log("✓ Executed:", statement.substring(0, 50) + "...")
  } catch (error) {
    console.error("✗ Failed:", statement.substring(0, 50) + "...")
    console.error(error)
  }
}

console.log("\n✓ Database initialized successfully!")
console.log("Database location:", join(process.cwd(), "data", "catform.db"))

db.close()
