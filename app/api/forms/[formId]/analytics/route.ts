import { type NextRequest, NextResponse } from "next/server"
import { getFormAnalytics } from "@/lib/db-helpers"

// GET /api/forms/:formId/analytics - Get analytics for form
export async function GET(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30", 10)

    const analytics = getFormAnalytics(formId, days)

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
