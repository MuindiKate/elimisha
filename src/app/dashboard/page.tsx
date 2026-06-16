import { createServerSideClient } from '@/lib/supabase.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSideClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch application stats
  const { data: applications } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', user.id)

  // Fetch 3 closest deadlines from bursaries
  const { data: upcoming } = await supabase
    .from('bursaries')
    .select('id, title, provider, deadline, type')
    .eq('is_active', true)
    .gte('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })
    .limit(3)

  const stats = {
    total: applications?.length || 0,
    saved: applications?.filter(a => a.status === 'saved').length || 0,
    applied: applications?.filter(a => a.status === 'applied').length || 0,
    awarded: applications?.filter(a => a.status === 'awarded').length || 0,
  }

  const isProfileComplete = profile?.level_of_education && 
    profile?.county_of_origin && 
    profile?.institution

  const TYPE_COLORS: Record<string, string> = {
    county: 'bg-blue-50 text-blue-700',
    cdf: 'bg-purple-50 text-purple-700',
    university: 'bg-green-50 text-green-700',
    ngo: 'bg-orange-50 text-orange-700',
    private: 'bg-pink-50 text-pink-700',
    government: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">Elimisha</span>
          <div className="flex items-center gap-6">
            <Link href="/bursaries"
              className="text-sm text-gray-600 hover:text-green-600 
              transition-colors font-medium">
              Browse
            </Link>
            <Link href="/applications"
              className="text-sm text-gray-600 hover:text-green-600 
              transition-colors font-medium">
              My Applications
            </Link>
            <Link href="/onboarding"
              className="text-sm text-gray-600 hover:text-green-600 
              transition-colors font-medium">
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Hey, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's your bursary overview
          </p>
        </div>

        {/* Profile incomplete banner */}
        {!isProfileComplete && (
          <Link href="/onboarding">
            <div className="bg-amber-50 border border-amber-100 rounded-xl 
            p-4 mb-6 flex items-center justify-between hover:border-amber-200 
            transition-colors">
              <div>
                <p className="font-medium text-amber-800 text-sm">
                  Complete your profile
                </p>
                <p className="text-amber-600 text-xs mt-0.5">
                  Add your education details to get matched to bursaries
                </p>
              </div>
              <span className="text-amber-600 text-sm font-medium">
                Set up →
              </span>
            </div>
          </Link>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total tracked', value: stats.total, color: 'text-gray-900' },
            { label: 'Saved', value: stats.saved, color: 'text-gray-500' },
            { label: 'Applied', value: stats.applied, color: 'text-blue-600' },
            { label: 'Awarded', value: stats.awarded, color: 'text-green-600' },
          ].map(stat => (
            <div key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-5">
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
            <div className="space-y-3">
              <Link href="/bursaries"
                className="flex items-center justify-between p-3 rounded-lg 
                bg-green-50 hover:bg-green-100 transition-colors">
                <div>
                  <p className="font-medium text-green-800 text-sm">
                    Browse bursaries
                  </p>
                  <p className="text-green-600 text-xs mt-0.5">
                    Find new opportunities
                  </p>
                </div>
                <span className="text-green-600">→</span>
              </Link>

              <Link href="/applications"
                className="flex items-center justify-between p-3 rounded-lg 
                bg-blue-50 hover:bg-blue-100 transition-colors">
                <div>
                  <p className="font-medium text-blue-800 text-sm">
                    My applications
                  </p>
                  <p className="text-blue-600 text-xs mt-0.5">
                    Track your progress
                  </p>
                </div>
                <span className="text-blue-600">→</span>
              </Link>

              <Link href="/onboarding"
                className="flex items-center justify-between p-3 rounded-lg 
                bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-700 text-sm">
                    Update profile
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Keep your details current
                  </p>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Closing soon
              </h2>
              <Link href="/bursaries"
                className="text-xs text-green-600 hover:underline">
                See all
              </Link>
            </div>

            {upcoming && upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map(bursary => {
                  const daysLeft = Math.ceil(
                    (new Date(bursary.deadline).getTime() - new Date().getTime())
                    / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <Link
                      key={bursary.id}
                      href={`/bursaries/${bursary.id}`}
                      className="block p-3 rounded-lg border border-gray-100 
                      hover:border-green-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm 
                          truncate">
                            {bursary.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {bursary.provider}
                          </p>
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${
                          daysLeft <= 7 ? 'text-red-600' :
                          daysLeft <= 30 ? 'text-orange-500' : 'text-gray-400'
                        }`}>
                          {daysLeft}d left
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}