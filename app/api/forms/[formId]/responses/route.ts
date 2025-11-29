import { type NextRequest, NextResponse } from "next/server"
import { createResponse, createResponseAnswer, getFormResponses, trackAnalyticsEvent } from "@/lib/db-helpers"

// GET /api/forms/:formId/responses - Get all responses for form
export async function GET(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const responses = getFormResponses(formId)

    return NextResponse.json({ responses })
  } catch (error) {
    console.error("[v0] Error fetching responses:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}

// POST /api/forms/:formId/responses - Submit form response
export async function POST(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const body = await request.json()
    const { answers, metadata } = body

    // Get client info
    const userAgent = request.headers.get("user-agent") || undefined
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")

    // Create response
    const responseId = createResponse({
      form_id: formId,
      user_fingerprint: metadata?.fingerprint,
      ip_address: ip || null,
      user_agent: userAgent || null,
      country: metadata?.country || null,
      city: metadata?.city || null,
      device_type: metadata?.deviceType || null,
      referrer: metadata?.referrer || null,
      completed: true,
      completion_time: metadata?.completionTime || null,
    })

    // Create answers
    for (const answer of answers) {
      createResponseAnswer(responseId, answer.fieldId, answer.value)
    }

    // Track analytics
    trackAnalyticsEvent(formId, "submit", responseId)

    return NextResponse.json({ responseId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error submitting response:", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}
