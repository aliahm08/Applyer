"use client"

import { createBrowserClient } from "@supabase/ssr"
import { type SupabaseClient } from "@supabase/supabase-js"
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/config"

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey())
  }

  return browserClient
}
