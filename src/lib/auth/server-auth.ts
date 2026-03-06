import { type User } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/rest"
import { createServerAuthClient } from "@/lib/supabase/server"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

export type VerifiedSupabaseUser = {
  uid: string
  email: string | null
  name: string | null
  picture: string | null
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 401,
  ) {
    super(message)
  }
}

function readBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
}

function toVerifiedUser(user: User): VerifiedSupabaseUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    name: (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? null,
    picture: (user.user_metadata?.avatar_url as string | undefined) ?? (user.user_metadata?.picture as string | undefined) ?? null,
  }
}

export function assertTrustedOrigin(request: NextRequest) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return
  }

  const origin = request.headers.get("origin")
  if (!origin) {
    return
  }

  const originUrl = new URL(origin)
  const requestUrl = new URL(request.url)

  if (originUrl.protocol !== requestUrl.protocol || originUrl.host !== requestUrl.host) {
    throw new AuthError("Invalid request origin", 403)
  }
}

export async function requireAuth(request: NextRequest): Promise<VerifiedSupabaseUser> {
  const bearerToken = readBearerToken(request)
  if (bearerToken) {
    const { data, error } = await getSupabaseAdmin().auth.getUser(bearerToken)

    if (error || !data.user) {
      throw new AuthError("Invalid auth token", 401)
    }

    return toVerifiedUser(data.user)
  }

  let supabase
  try {
    supabase = await createServerAuthClient()
  } catch (error) {
    throw new AuthError(error instanceof Error ? error.message : "Auth is not configured", 503)
  }

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new AuthError("Missing auth session", 401)
  }

  return toVerifiedUser(data.user)
}

export function createRouteErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const message = error instanceof Error ? error.message : String(error)
  return NextResponse.json({ error: fallbackMessage, details: message }, { status: 500 })
}
