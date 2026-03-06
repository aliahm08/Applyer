import { NextRequest, NextResponse } from "next/server"
import { assertTrustedOrigin, createRouteErrorResponse, requireAuth } from "@/lib/auth/server-auth"
import { updateApplication } from "@/lib/supabase/rest"

const ALLOWED_STATUSES = new Set(["queued", "generating", "pending", "submitted", "skipped"])

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertTrustedOrigin(request)
    const user = await requireAuth(request)
    const { id } = await params
    const { status, letter } = (await request.json()) as {
      status?: "queued" | "generating" | "pending" | "submitted" | "skipped"
      letter?: string
    }

    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid application status" }, { status: 400 })
    }

    const normalizedLetter = typeof letter === "string" ? letter.trim().slice(0, 20000) : undefined

    if (!status && typeof normalizedLetter === "undefined") {
      return NextResponse.json({ error: "At least one patch field is required" }, { status: 400 })
    }

    const row = await updateApplication(id, user.uid, { status, letter: normalizedLetter })
    if (!row) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({ application: row })
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to update application")
  }
}
