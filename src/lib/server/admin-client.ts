import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

/**
 * Service-role Supabase client for privileged server-side operations only
 * (creating/removing auth users). NEVER import this from client components —
 * the service role key bypasses Row Level Security.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
