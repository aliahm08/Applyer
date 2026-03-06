import { NextRequest, NextResponse } from "next/server"
import {
  createResume,
  deleteResumeFile,
  getResumeLimits,
  listResumes,
  setActiveResume,
  uploadResumeFile,
} from "@/lib/supabase/rest"
import { assertTrustedOrigin, createRouteErrorResponse, requireAuth } from "@/lib/auth/server-auth"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const resumes = await listResumes(user.uid)
    return NextResponse.json({ resumes })
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to load resumes")
  }
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request)
    const user = await requireAuth(request)
    const formData = await request.formData()
    const file = formData.get("file")
    const makeActive = formData.get("makeActive") === "true"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    const limits = getResumeLimits()

    if (file.type !== limits.allowedMimeType) {
      return NextResponse.json({ error: "Only PDF resumes are supported" }, { status: 400 })
    }

    if (file.size > limits.maxBytes) {
      return NextResponse.json({ error: "Resume must be 5MB or smaller" }, { status: 400 })
    }

    const existingResumes = await listResumes(user.uid)
    const storagePath = await uploadResumeFile(user.uid, file.name, await file.arrayBuffer(), file.type)

    try {
      const createdResume = await createResume({
        user_id: user.uid,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        is_active: false,
      })

      const resume = makeActive || existingResumes.length === 0 ? await setActiveResume(user.uid, createdResume.id) : createdResume
      return NextResponse.json({ resume }, { status: 201 })
    } catch (error) {
      await deleteResumeFile(storagePath).catch(() => undefined)
      throw error
    }
  } catch (error) {
    return createRouteErrorResponse(error, "Failed to upload resume")
  }
}
