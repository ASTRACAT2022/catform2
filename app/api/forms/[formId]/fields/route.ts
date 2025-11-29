import { type NextRequest, NextResponse } from "next/server"
import { createFormField, getFormFields } from "@/lib/db-helpers"

// GET /api/forms/:formId/fields - Get all fields for form
export async function GET(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const fields = getFormFields(formId)

    return NextResponse.json({ fields })
  } catch (error) {
    console.error("[v0] Error fetching fields:", error)
    return NextResponse.json({ error: "Failed to fetch fields" }, { status: 500 })
  }
}

// POST /api/forms/:formId/fields - Create new field
export async function POST(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const body = await request.json()

    const field = createFormField({
      form_id: formId,
      type: body.type,
      label: body.label,
      description: body.description || null,
      placeholder: body.placeholder || null,
      options: body.options || null,
      validation: body.validation || {},
      position: body.position,
      settings: body.settings || {},
    })

    return NextResponse.json({ field }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating field:", error)
    return NextResponse.json({ error: "Failed to create field" }, { status: 500 })
  }
}
