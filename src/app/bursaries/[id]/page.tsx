'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// AI Match Score component
// Calls our API route which calls Anthropic
function AIMatchScore({ bursaryId, bursary }: { 
  bursaryId: string
  bursary: Bursary 
}) {
  const [score, setScore] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  async function getMatchScore() {
    if (!profile) return
    setLoading(true)

    try {
      // Call our server-side API route
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, bursary })
      })

      const data = await response.json()
      setScore(data)
    } catch (error) {
      console.error('Error getting match score:', error)
    }

    setLoading(false)
  }

  // Color coding based on score
  const scoreColor = score?.score >= 75
    ? 'text-green-600'
    : score?.score >= 50
    ? 'text-orange-500'
    : 'text-red-500'

  const scoreBg = score?.score >= 75
    ? 'bg-green-50 border-green-100'
    : score?.score >= 50
    ? 'bg-orange-50 border-orange-100'
    : 'bg-red-50 border-red-100'

  if (!profile) return null

  return (
    <div className={`rounded-xl border p-5 mb-4 ${
      score ? scoreBg : 'bg-gray-50 border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            ✨ AI Match Score
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            How well this bursary fits your profile
          </p>
        </div>
        {score && (
          <div className="text-right">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {score.score}
            </span>
            <span className="text-gray-400 text-sm">/100</span>
          </div>
        )}
      </div>

      {score ? (
        <div className="space-y-3">
          {/* Score bar */}
          <div className="w-full bg-white rounded-full h-2 border border-gray-100">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                score.score >= 75 ? 'bg-green-500' :
                score.score >= 50 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${score.score}%` }}
            />
          </div>

          {/* Eligibility */}
          <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
            score.eligible
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {score.eligible ? '✓ You appear eligible' : '✗ You may not be eligible'}
          </div>

          {/* Reason */}
          <p className="text-sm text-gray-600">{score.reason}</p>

          {/* Tip */}
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">💡 Application tip</p>
            <p className="text-sm text-gray-600">{score.tip}</p>
          </div>

          {/* Refresh */}
          <button
            onClick={getMatchScore}
            disabled={loading}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Recalculate
          </button>
        </div>
      ) : (
        <button
          onClick={getMatchScore}
          disabled={loading}
          className="w-full bg-white border border-gray-200 hover:border-green-300 
          text-gray-700 font-medium py-2 rounded-lg text-sm transition-colors
          disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-3 w-3 border-b border-gray-600" />
              Analysing your profile...
            </span>
          ) : (
            'Check my match score →'
          )}
        </button>
      )}
    </div>
  )
}

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
  eligibility_income_max: number | null
  description: string
  how_to_apply: string
  documents_required: string[]
  external_link: string | null
  is_active: boolean
}

const TYPE_COLORS: Record<string, string> = {
  county: 'bg-blue-50 text-blue-700',
  cdf: 'bg-purple-50 text-purple-700',
  university: 'bg-green-50 text-green-700',
  ngo: 'bg-orange-50 text-orange-700',
  private: 'bg-pink-50 text-pink-700',
  government: 'bg-yellow-50 text-yellow-700',
}

const TYPE_LABELS: Record<string, string> = {
  county: 'County', cdf: 'CDF', university: 'University',
  ngo: 'NGO', private: 'Private', government: 'Government',
}

function formatAmount(min: number | null, max: number | null) {
  if (!min && !max) return 'Amount varies'
  if (!min && max) return `Up to KES ${max.toLocaleString()}`
  if (min && !max) return `From KES ${min.toLocaleString()}`
  return `KES ${min!.toLocaleString()} – ${max!.toLocaleString()}`
}

export default function BursaryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [bursary, setBursary] = useState<Bursary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchBursary()
    fetchUser()
  }, [id])

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      // Check if student already saved/applied to this bursary
      const { data } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', user.id)
        .eq('bursary_id', id)
        .single()
      if (data) setApplicationStatus(data.status)
    }
  }

  async function fetchBursary() {
    // Fetch single bursary by ID from URL params
    const { data, error } = await supabase
      .from('bursaries')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      router.push('/bursaries')
      return
    }

    setBursary(data)
    setLoading(false)
  }

  async function handleSave(status: 'saved' | 'applied') {
    if (!user) {
      router.push('/login')
      return
    }

    setSaving(true)

    // Upsert — inserts if doesn't exist, updates if it does
    // This prevents duplicate applications for the same bursary
    const { error } = await supabase
      .from('applications')
      .upsert({
        user_id: user.id,
        bursary_id: id,
        status,
        applied_at: status === 'applied' ? new Date().toISOString() : null,
      }, {
        onConflict: 'user_id,bursary_id'
      })

    if (!error) setApplicationStatus(status)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  if (!bursary) return null

  const daysLeft = Math.ceil(
    (new Date(bursary.deadline).getTime() - new Date().getTime())
    / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/bursaries"
          className="text-sm text-green-600 font-medium hover:underline mb-6 block"
        >
          ← Back to bursaries
        </Link>
         {/* AI Match Score */}
        <AIMatchScore bursaryId={id as string} bursary={bursary} />

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-4">

          {/* Type badge + deadline urgency */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full 
            ${TYPE_COLORS[bursary.type]}`}>
              {TYPE_LABELS[bursary.type]}
            </span>
            <span className={`text-sm font-medium ${
              daysLeft <= 7 ? 'text-red-600' :
              daysLeft <= 30 ? 'text-orange-500' : 'text-gray-500'
            }`}>
              {daysLeft <= 0 ? 'Closed' :
               daysLeft <= 7 ? `⚠️ ${daysLeft} days left` :
               `${daysLeft} days left`}
            </span>
          </div>

          {/* Title and provider */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {bursary.title}
          </h1>
          <p className="text-gray-500 mb-6">{bursary.provider}</p>

          {/* Key details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Amount</p>
              <p className="font-semibold text-gray-900 text-sm">
                {formatAmount(bursary.amount_min, bursary.amount_max)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Deadline</p>
              <p className="font-semibold text-gray-900 text-sm">
                {new Date(bursary.deadline).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            {bursary.eligibility_counties.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Counties</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {bursary.eligibility_counties.join(', ')}
                </p>
              </div>
            )}
            {bursary.eligibility_income_max && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Max household income</p>
                <p className="font-semibold text-gray-900 text-sm">
                  KES {bursary.eligibility_income_max.toLocaleString()}/month
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {bursary.description}
            </p>
          </div>

          {/* Eligibility levels */}
          {bursary.eligibility_levels.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Who can apply
              </h2>
              <div className="flex gap-2 flex-wrap">
                {bursary.eligibility_levels.map(level => (
                  <span key={level}
                    className="text-xs px-3 py-1 bg-green-50 text-green-700 
                    rounded-full capitalize">
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to apply */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">How to apply</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {bursary.how_to_apply}
            </p>
          </div>

          {/* Documents required */}
          {bursary.documents_required.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Documents required
              </h2>
              <ul className="space-y-2">
                {bursary.documents_required.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

     {/* External link */}
          {bursary.external_link && (
            
             <a href={bursary.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-green-600 font-medium hover:underline mb-6"
            >
              Visit official website →
            </a>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {applicationStatus === 'applied' ? (
              <div className="flex-1 text-center py-2.5 bg-green-50 text-green-700 
              rounded-lg text-sm font-medium">
                ✅ Marked as applied
              </div>
            ) : applicationStatus === 'saved' ? (
              <>
                <button
                  onClick={() => handleSave('applied')}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white 
                  font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Mark as applied'}
                </button>
                <div className="flex-1 text-center py-2.5 bg-gray-50 text-gray-500 
                rounded-lg text-sm">
                  ✓ Saved
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSave('applied')}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white 
                  font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Mark as applied'}
                </button>
                <button
                  onClick={() => handleSave('saved')}
                  disabled={saving}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 
                  font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save for later'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}