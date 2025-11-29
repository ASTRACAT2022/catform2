import { type NextRequest, NextResponse } from "next/server"
import { updateFormField, deleteFormField } from "@/lib/db-helpers"

// PATCH /api/forms/:formId/fields/:fieldId - Update field
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; fieldId: string }> },
) {
  try {
    const { fieldId } = await params
    const body = await request.json()

    updateFormField(fieldId, body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating field:", error)
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 })
  }
}

// DELETE /api/forms/:formId/fields/:fieldId - Delete field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; fieldId: string }> },
) {
  try {
    const { fieldId } = await params
    deleteFormField(fieldId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting field:", error)
    return NextResponse.json({ error: "Failed to delete field" }, { status: 500 })
  }
}
