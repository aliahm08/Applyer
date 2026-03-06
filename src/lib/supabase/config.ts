const DEFAULT_SUPABASE_URL = "https://kdfomnzerofiokofzylt.supabase.co"

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) {
      return value
    }
  }

  return null
}

export function getSupabaseUrl() {
  return readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL") ?? DEFAULT_SUPABASE_URL
}

export function getSupabasePublishableKey() {
  const value = getOptionalSupabasePublishableKey()
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }

  return value
}

export function getOptionalSupabasePublishableKey() {
  return readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export function getSupabaseSecretKey() {
  const value = readEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY")
  if (!value) {
    throw new Error("Missing SUPABASE_SECRET_KEY")
  }

  return value
}
