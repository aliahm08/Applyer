import { NextRequest, NextResponse } from "next/server"
import { searchJobs } from "@/lib/jobs/search"

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query") ?? ""
    const location = request.nextUrl.searchParams.get("location") ?? ""
    const jobs = await searchJobs(query, location)
    return NextResponse.json({ jobs })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: "Failed to load jobs", details: message }, { status: 502 })
  }
}
