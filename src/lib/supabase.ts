import { createBrowserClient } from '@supabase/ssr'

// CLIENT SIDE only — safe to use in any component
// Does not import next/headers so works in both 
// client and server components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}