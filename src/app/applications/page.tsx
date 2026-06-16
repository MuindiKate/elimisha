'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type Application = {
  id: string
  status: string
  applied_at: string | null
  created_at: string
  bursaries: {
    id: string
    title: string
    provider: string
    type: string
    amount_min: number | null
    amount_max: number | null
    deadline: string
  }
}

const STATUS_STYLES: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-600',
  applied: 'bg-blue-50 text-blue-700',
  pending: 'bg-yellow-50 text-yellow-700',
  awarded: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  pending: 'Pending',
  awarded: '🎉 Awarded',
  rejected: 'Rejected',
}

const TYPE_COLORS: Record<string, string> = {
  county: 'bg-blue-50 text-blue-700',
  cdf: 'bg-purple-50 text-purple-700',
  university: 'bg-green-50 text-green-700',
  ngo: 'bg-orange-50 text-orange-700',
  private: 'bg-pink-50 text-pink-700',
  government: 'bg-yellow-50 text-yellow-700',
}

function formatAmount(min: number | null, max: number | null) {
  if (!min && !max) return 'Amount varies'
  if (!min && max) return `Up to KES ${max.toLocaleString()}`
  if (min && !max) return `From KES ${min.toLocaleString()}`
  return `KES ${min!.toLocaleString()} – ${max!.toLocaleString()}`
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [filterStatus])

  async function fetchApplications() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Join applications with bursaries table
    // This fetches application + full bursary details in one query
    let query = supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        created_at,
        bursaries (
          id,
          title,
          provider,
          type,
          amount_min,
          amount_max,
          deadline
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filterStatus) {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching applications:', error)
    } else {
    setApplications((data as unknown as Application[]) || [])
    }

    setLoading(false)
  }

  async function updateStatus(applicationId: string, newStatus: string) {
    setUpdatingId(applicationId)

    const { error } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        applied_at: newStatus === 'applied' ? new Date().toISOString() : null
      })
      .eq('id', applicationId)

    if (!error) {
      // Update local state immediately without refetching
      // This is called optimistic UI — update UI before server confirms
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      )
    }

    setUpdatingId(null)
  }

  async function removeApplication(applicationId: string) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)

    if (!error) {
      setApplications(prev => prev.filter(app => app.id !== applicationId))
    }
  }

  // Group applications by status for summary stats
  const stats = {
    total: applications.length,
    saved: applications.filter(a => a.status === 'saved').length,
    applied: applications.filter(a => a.status === 'applied').length,
    awarded: applications.filter(a => a.status === 'awarded').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Track your bursary applications
              </p>
            </div>
            <Link
              href="/bursaries"
              className="text-sm text-green-600 font-medium hover:underline"
            >
              + Find more
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-gray-900' },
              { label: 'Saved', value: stats.saved, color: 'text-gray-500' },
              { label: 'Applied', value: stats.applied, color: 'text-blue-600' },
              { label: 'Awarded', value: stats.awarded, color: 'text-green-600' },
            ].map(stat => (
              <div key={stat.label}
                className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="max-w-3xl mx-auto flex gap-1 overflow-x-auto">
          {['', 'saved', 'applied', 'pending', 'awarded', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 
              transition-colors ${
                filterStatus === status
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {status === '' ? 'All' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Applications list */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 
              p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium text-gray-700">No applications yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Start saving bursaries you're interested in
            </p>
            <Link
              href="/bursaries"
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg 
              text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Browse bursaries
            </Link>
          </div>
        ) : (
          applications.map(app => {
            const bursary = app.bursaries
            const daysLeft = Math.ceil(
              (new Date(bursary.deadline).getTime() - new Date().getTime())
              / (1000 * 60 * 60 * 24)
            )

            return (
              <div key={app.id}
                className="bg-white rounded-xl border border-gray-100 p-5">

                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 
                      rounded-full ${TYPE_COLORS[bursary.type]}`}>
                        {bursary.type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 
                      rounded-full ${STATUS_STYLES[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>
                    <Link
                      href={`/bursaries/${bursary.id}`}
                      className="font-semibold text-gray-900 hover:text-green-600 
                      transition-colors"
                    >
                      {bursary.title}
                    </Link>
                    <p className="text-sm text-gray-500">{bursary.provider}</p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeApplication(app.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors 
                    text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Amount + deadline */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-gray-700 font-medium">
                    {formatAmount(bursary.amount_min, bursary.amount_max)}
                  </span>
                  <span className={
                    daysLeft <= 7 ? 'text-red-600' :
                    daysLeft <= 30 ? 'text-orange-500' : 'text-gray-400'
                  }>
                    {daysLeft <= 0 ? 'Closed' :
                     daysLeft <= 7 ? `⚠️ ${daysLeft} days left` :
                     `${daysLeft} days left`}
                  </span>
                </div>

                {/* Update status dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Update status:</span>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    disabled={updatingId === app.id}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 
                    bg-white focus:outline-none focus:ring-1 focus:ring-green-500
                    disabled:opacity-50"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="pending">Pending</option>
                    <option value="awarded">Awarded</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {updatingId === app.id && (
                    <span className="text-xs text-gray-400">Saving...</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}