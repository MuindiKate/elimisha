'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

// TypeScript type that mirrors our bursaries table
// This gives us autocomplete and catches errors at compile time
type Bursary = {
  id: string
  title: string
  provider: string
  type: string
  amount_min: number | null
  amount_max: number | null
  deadline: string
  eligibility_counties: string[]
  eligibility_levels: string[]
  description: string
  is_active: boolean
}

// Maps our database enum values to readable labels
const TYPE_LABELS: Record<string, string> = {
  county: 'County',
  cdf: 'CDF',
  university: 'University',
  ngo: 'NGO',
  private: 'Private',
  government: 'Government',
}

// Color coding by bursary type for visual scanning
const TYPE_COLORS: Record<string, string> = {
  county: 'bg-blue-50 text-blue-700',
  cdf: 'bg-purple-50 text-purple-700',
  university: 'bg-green-50 text-green-700',
  ngo: 'bg-orange-50 text-orange-700',
  private: 'bg-pink-50 text-pink-700',
  government: 'bg-yellow-50 text-yellow-700',
}

// Formats deadline date and shows urgency
function DeadlineBadge({ deadline }: { deadline: string }) {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  const formatted = deadlineDate.toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  // Color changes based on urgency
  const urgencyColor = daysLeft <= 7
    ? 'text-red-600'
    : daysLeft <= 30
    ? 'text-orange-500'
    : 'text-gray-500'

  return (
    <span className={`text-xs ${urgencyColor}`}>
      {daysLeft <= 0
        ? 'Closed'
        : daysLeft <= 7
        ? `⚠️ ${daysLeft} days left`
        : daysLeft <= 30
        ? `${daysLeft} days left`
        : `Closes ${formatted}`
      }
    </span>
  )
}

// Formats amount range nicely
function formatAmount(min: number | null, max: number | null) {
  if (!min && !max) return 'Amount varies'
  if (!min && max) return `Up to KES ${max.toLocaleString()}`
  if (min && !max) return `From KES ${min.toLocaleString()}`
  return `KES ${min!.toLocaleString()} – ${max!.toLocaleString()}`
}

export default function BursariesPage() {
  const [bursaries, setBursaries] = useState<Bursary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCounty, setFilterCounty] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchBursaries()
  }, [filterType, filterCounty])

  async function fetchBursaries() {
    setLoading(true)

    // Start building the query
    // Supabase lets us chain filters — only active bursaries
    let query = supabase
      .from('bursaries')
      .select('*')
      .eq('is_active', true)
      .order('deadline', { ascending: true })

    // Apply type filter if selected
    if (filterType) {
      query = query.eq('type', filterType)
    }

    // Apply county filter if selected
    // cs means "contains" — checks if array contains the value
    if (filterCounty) {
      query = query.contains('eligibility_counties', [filterCounty])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bursaries:', error)
    } else {
      setBursaries(data || [])
    }

    setLoading(false)
  }

  // Client-side search filter on top of database results
  const filtered = bursaries.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.provider.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bursaries & Scholarships
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {filtered.length} opportunities available
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-green-600 font-medium hover:underline"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search bursaries or providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
            text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
            focus:border-transparent mb-4"
          />

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm 
              bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All types</option>
              <option value="county">County</option>
              <option value="cdf">CDF</option>
              <option value="university">University</option>
              <option value="ngo">NGO</option>
              <option value="private">Private</option>
              <option value="government">Government</option>
            </select>

            <select
              value={filterCounty}
              onChange={(e) => setFilterCounty(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm 
              bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All counties</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Kisumu">Kisumu</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Nakuru">Nakuru</option>
            </select>

            {/* Clear filters */}
            {(filterType || filterCounty || search) && (
              <button
                onClick={() => {
                  setFilterType('')
                  setFilterCounty('')
                  setSearch('')
                }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm 
                text-gray-500 hover:bg-gray-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bursary cards */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 
              p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium">No bursaries found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map(bursary => (
            <div
              key={bursary.id}
              className="bg-white rounded-xl border border-gray-100 p-6 
              hover:border-green-200 hover:shadow-sm transition-all"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full 
                    ${TYPE_COLORS[bursary.type]}`}>
                      {TYPE_LABELS[bursary.type]}
                    </span>
                    {bursary.eligibility_counties.length > 0 && (
                      <span className="text-xs text-gray-400">
                        📍 {bursary.eligibility_counties.join(', ')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base leading-snug">
                    {bursary.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {bursary.provider}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {bursary.description}
              </p>

              {/* Card footer */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatAmount(bursary.amount_min, bursary.amount_max)}
                  </span>
                  <DeadlineBadge deadline={bursary.deadline} />
                </div>
                <Link
                  href={`/bursaries/${bursary.id}`}
                  className="text-sm text-green-600 font-medium hover:underline"
                >
                  View details →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}