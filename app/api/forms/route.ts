import { type NextRequest, NextResponse } from "next/server"
import { createForm, getUserForms } from "@/lib/db-helpers"

// GET /api/forms - Get all forms for user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth session
    const userId = "demo_user_1"

    const forms = getUserForms(userId)

    return NextResponse.json({ forms })
  } catch (error) {
    console.error("[v0] Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

// POST /api/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // TODO: Get userId from auth session
    const userId = "demo_user_1"

    const form = createForm(userId, title, description)

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating form:", error)
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
  }
}
