import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/config"

const RESUME_BUCKET = "resumes"
const MAX_RESUME_BYTES = 5 * 1024 * 1024

type SupabaseApplicationRow = {
  id: string
  user_id: string
  company: string
  role: string
  source: string
  location: string | null
  job_url: string | null
  external_job_id: string | null
  description: string | null
  status: ApplicationStatus
  letter: string | null
  created_at: string
  updated_at: string
}

type SupabaseResumeRow = {
  id: string
  user_id: string
  file_name: string
  storage_path: string
  mime_type: string
  size_bytes: number
  is_active: boolean
  created_at: string
}

export type ApplicationStatus = "queued" | "generating" | "pending" | "submitted" | "skipped"

export type ApplicationRecord = SupabaseApplicationRow

export type NewApplicationRecord = Omit<ApplicationRecord, "id" | "created_at" | "updated_at">

export type ResumeRecord = SupabaseResumeRow

export type NewResumeRecord = Omit<ResumeRecord, "id" | "created_at">

let supabaseAdmin: SupabaseClient | null = null
let resumeBucketReady = false

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return supabaseAdmin
}

function normalizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function ensureResumeBucket() {
  if (resumeBucketReady) {
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.createBucket(RESUME_BUCKET, {
    public: false,
    fileSizeLimit: MAX_RESUME_BYTES,
    allowedMimeTypes: ["application/pdf"],
  })

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create resumes bucket: ${error.message}`)
  }

  resumeBucketReady = true
}

export async function listApplications(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to list applications: ${error.message}`)
  }

  return (data ?? []) as ApplicationRecord[]
}

export async function createApplications(records: NewApplicationRecord[]) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("applications")
    .upsert(records, {
      onConflict: "user_id,external_job_id",
      ignoreDuplicates: true,
    })
    .select("*")

  if (error) {
    throw new Error(`Failed to create applications: ${error.message}`)
  }

  return (data ?? []) as ApplicationRecord[]
}

export async function updateApplication(
  id: string,
  userId: string,
  patch: Partial<Pick<ApplicationRecord, "status" | "letter">>,
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to update application: ${error.message}`)
  }

  return (data as ApplicationRecord | null) ?? null
}

export async function listResumes(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to list resumes: ${error.message}`)
  }

  return (data ?? []) as ResumeRecord[]
}

export async function createResume(record: NewResumeRecord) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("resumes").insert(record).select("*").single()

  if (error) {
    throw new Error(`Failed to create resume: ${error.message}`)
  }

  return data as ResumeRecord
}

export async function setActiveResume(userId: string, resumeId: string) {
  const supabase = getSupabaseAdmin()
  const { error: clearError } = await supabase
    .from("resumes")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true)

  if (clearError) {
    throw new Error(`Failed to clear active resume: ${clearError.message}`)
  }

  const { data, error } = await supabase
    .from("resumes")
    .update({ is_active: true })
    .eq("id", resumeId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to set active resume: ${error.message}`)
  }

  return (data as ResumeRecord | null) ?? null
}

export async function uploadResumeFile(userId: string, fileName: string, fileBytes: ArrayBuffer, contentType: string) {
  await ensureResumeBucket()

  const safeFileName = normalizeFileName(fileName) || "resume.pdf"
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeFileName}`
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(RESUME_BUCKET).upload(storagePath, fileBytes, {
    contentType,
    upsert: false,
  })

  if (error) {
    throw new Error(`Failed to upload resume file: ${error.message}`)
  }

  return storagePath
}

export async function deleteResumeFile(storagePath: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(RESUME_BUCKET).remove([storagePath])

  if (error) {
    throw new Error(`Failed to delete resume file: ${error.message}`)
  }
}

export function getResumeLimits() {
  return {
    maxBytes: MAX_RESUME_BYTES,
    allowedMimeType: "application/pdf",
  }
}
