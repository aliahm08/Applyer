import { NextRequest, NextResponse } from "next/server"
import { createApplications } from "@/lib/supabase/rest"
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

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request)
    const user = await requireAuth(request)
    const { jobs } = (await request.json()) as {
      jobs?: Array<{
        company?: string
        role?: string
        source?: string
        location?: string
        jobUrl?: string
        externalJobId?: string
        description?: string
      }>
    }

    if (!jobs?.length) {
      return NextResponse.json({ error: "jobs[] is required" }, { status: 400 })
    }

    const prepared = jobs
      .map((job) => ({
        company: cleanText(job.company, 160),
        role: cleanText(job.role, 160),
        source: cleanText(job.source, 80) ?? "manual",
        location: cleanText(job.location, 160),
        job_url: cleanText(job.jobUrl, 500),
        external_job_id: cleanText(job.externalJobId, 200),
        description: cleanText(job.description, 8000),
      }))
      .filter((job) => job.company && job.role)
      .map((job) => ({
        company: job.company as string,
        role: job.role as string,
        source: job.source,
        location: job.location,
        job_url: job.job_url,
        external_job_id: job.external_job_id,
        description: job.description,
        status: "queued" as const,
        letter: null,
        user_id: user.uid,
      }))

    const rows = await createApplications(prepared)

    return NextResponse.json({ count: rows.length, applications: rows }, { status: 201 })
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to batch create applications")
  }
}
