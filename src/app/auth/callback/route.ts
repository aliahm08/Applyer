import { NextRequest, NextResponse } from "next/server"
import { createServerAuthClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/"

  try {
    if (code) {
      const supabase = await createServerAuthClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/?error=auth-not-configured", requestUrl.origin))
  }

  return NextResponse.redirect(new URL("/?error=auth-callback", requestUrl.origin))
}
