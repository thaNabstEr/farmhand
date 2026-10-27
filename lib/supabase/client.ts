import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "./database.types"

let supabaseInstance: SupabaseClient<Database> | null = null

export function sanitizeSupabaseUrl(rawUrl: string): string {
  let cleaned = rawUrl.trim().replace(/\/+$/, "")
  if (cleaned.endsWith("/rest/v1")) {
    cleaned = cleaned.slice(0, -"/rest/v1".length).replace(/\/+$/, "")
  }
  return cleaned
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  // Return cached client if already instantiated
  if (supabaseInstance) {
    return supabaseInstance
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!rawUrl || !supabaseAnonKey) {
    return null
  }

  const supabaseUrl = sanitizeSupabaseUrl(rawUrl)

  try {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey)
    supabaseInstance = client
    return client
  } catch (err) {
    console.error("Failed to initialize Supabase client safely:", err)
    return null
  }
}

export default getSupabaseClient
