import { NextRequest, NextResponse } from "next/server"
import { createApplications, listApplications } from "@/lib/supabase/rest"
import { assertTrustedOrigin, createRouteErrorResponse, requireAuth } from "@/lib/auth/server-auth"

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  return normalized.slice(0, maxLength)
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const rows = await listApplications(user.uid)
    return NextResponse.json({ applications: rows })
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to load applications")
  }
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request)
    const user = await requireAuth(request)
    const payload = (await request.json()) as {
      company?: string
      role?: string
      source?: string
      location?: string
      jobUrl?: string
      externalJobId?: string
      description?: string
    }

    const company = cleanText(payload.company, 160)
    const role = cleanText(payload.role, 160)

    if (!company || !role) {
      return NextResponse.json({ error: "company and role are required" }, { status: 400 })
    }

    const rows = await createApplications([
      {
        company,
        role,
        source: cleanText(payload.source, 80) ?? "manual",
        location: cleanText(payload.location, 160),
        job_url: cleanText(payload.jobUrl, 500),
        external_job_id: cleanText(payload.externalJobId, 200),
        description: cleanText(payload.description, 8000),
        status: "queued",
        letter: null,
        user_id: user.uid,
      },
    ])

    return NextResponse.json({ application: rows[0] }, { status: 201 })
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to create application")
  }
}
