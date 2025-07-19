import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabase) {
    return supabase
  }

  supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabase
}

export const supabaseClient = createClient()
