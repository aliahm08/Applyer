import { NextRequest, NextResponse } from "next/server"
import { setActiveResume } from "@/lib/supabase/rest"
import { assertTrustedOrigin, createRouteErrorResponse, requireAuth } from "@/lib/auth/server-auth"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertTrustedOrigin(request)
    const user = await requireAuth(request)
    const { id } = await params
    const { action } = (await request.json()) as { action?: string }

    if (action !== "set-active") {
      return NextResponse.json({ error: "Unsupported resume action" }, { status: 400 })
    }

    const resume = await setActiveResume(user.uid, id)
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({ resume })
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to update resume")
  }
}
