import { createServerSideClient } from '@/lib/supabase.server'
import { NextResponse } from 'next/server'

// This route handles the redirect after a user clicks
// the confirmation link in their email
// Supabase sends them here with a code in the URL
// We exchange that code for a session and redirect to dashboard
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSideClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/onboarding`)
}
