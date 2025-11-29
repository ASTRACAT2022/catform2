import { type NextRequest, NextResponse } from "next/server"
import { getFormWithFields, updateForm, deleteForm } from "@/lib/db-helpers"

// GET /api/forms/:formId - Get form with fields
export async function GET(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const form = getFormWithFields(formId)

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error("[v0] Error fetching form:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
}

// PATCH /api/forms/:formId - Update form
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const body = await request.json()

    updateForm(formId, body)

    const form = getFormWithFields(formId)

    return NextResponse.json({ form })
  } catch (error) {
    console.error("[v0] Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
  }
}

// DELETE /api/forms/:formId - Delete form
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    deleteForm(formId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting form:", error)
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
  }
}
