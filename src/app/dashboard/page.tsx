import { createServerSideClient } from '@/lib/supabase.server'
import { redirect } from 'next/navigation'

// This is a server component — it runs on the server
// It checks if the user is logged in before showing the page
// If not logged in, redirects to login immediately
export default async function DashboardPage() {
  const supabase = await createServerSideClient()
  
  // Get the currently logged in user
  const { data: { user } } = await supabase.auth.getUser()

  // If no user, kick them to login
  if (!user) {
    redirect('/login')
  }

  // Get their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Elimisha 🎓
          </h1>
          <p className="text-gray-500 mt-2">
            Hello, {profile?.full_name || user.email}!
          </p>
          <p className="text-sm text-green-600 mt-4 font-medium">
            ✅ Auth is working. Dashboard coming next.
          </p>
        </div>
      </div>
    </div>
  )
}