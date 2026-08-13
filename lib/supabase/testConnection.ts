import { getSupabaseClient } from "./client"

export interface SupabaseConnectionStatus {
  configured: boolean
  connected: boolean
  message: string
}

export async function verifySupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return {
      configured: false,
      connected: false,
      message: "Supabase configuration missing. Running in Local Persistence Mode.",
    }
  }

  const client = getSupabaseClient()
  if (!client) {
    return {
      configured: false,
      connected: false,
      message: "Failed to initialize Supabase client.",
    }
  }

  try {
    // Safe, non-table-creating auth session probe
    const { error } = await client.auth.getSession()

    if (error) {
      return {
        configured: true,
        connected: false,
        message: "Supabase connection test returned an auth error.",
      }
    }

    return {
      configured: true,
      connected: true,
      message: "Supabase client configured and connection verified.",
    }
  } catch {
    return {
      configured: true,
      connected: false,
      message: "Unable to connect to Supabase endpoint.",
    }
  }
}

export default verifySupabaseConnection
