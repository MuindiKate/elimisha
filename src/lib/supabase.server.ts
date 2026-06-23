import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// SERVER SIDE only — only import this in server components
// or server actions, never in client components
export async function createServerSideClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

import { createClient } from '@supabase/supabase-js'

// Admin client — uses service role key
// Bypasses RLS — only use in server-side API routes
// NEVER expose this to the browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}