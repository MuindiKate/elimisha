'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Bursary {
  id: string
  title: string
  provider: string
  description: string
  amount: string
  deadline: string
  eligibility_criteria: string
  documents_required: string[]
  category: string
}

export default function BursaryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [bursary, setBursary] = useState<Bursary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBursaryDetails() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('bursaries')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setBursary(data)

        // Check if application is already tracked by this authenticated session
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: existingApp, error: appError } = await supabase
            .from('applications')
            .select('id')
            .eq('user_id', user.id)
            .eq('bursary_id', id)
            .maybeSingle()
            
          if (existingApp) {
            setIsSaved(true)
          }
        }
      } catch (err: any) {
        console.error('Error fetching bursary details:', err)
        setError(err.message || 'Failed to load bursary details.')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchBursaryDetails()
  }, [id, supabase])

  const handleSaveBursary = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?message=Please log in to track bursaries.')
        return
      }

      if (isSaved) return

      // Explicitly insert matching your EXACT schema constraints:
      // status: 'Applied' 
      const { error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            user_id: user.id,
            bursary_id: id,
            status: 'Applied'
          }
        ])

      if (insertError) {
        // Log the complete deep object breakdown to avoid empty {} prints
        console.dir(insertError)
        throw new Error(insertError.message || `Database error code: ${insertError.code}`)
      }
      
      setIsSaved(true)
    } catch (err: any) {
      console.error('Detailed Error Context:', err)
      alert(err.message || 'Something went wrong while tracking.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse text-lg">Loading details...</div>
      </div>
    )
  }

  if (error || !bursary) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bursary Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The bursary you are looking for doesn't exist."}</p>
          <Link href="/bursaries" className="text-indigo-600 font-medium hover:underline">
            ← Back to bursaries listing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6">
          <Link href="/bursaries" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition flex items-center gap-1">
            ← Back to All Bursaries
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mb-3">
                {bursary.category || 'General'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {bursary.title}
              </h1>
              <p className="text-lg font-medium text-gray-600 mt-1">
                Issued by: <span className="text-gray-800">{bursary.provider}</span>
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <button
                onClick={handleSaveBursary}
                disabled={isSaving || isSaved}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
                }`}
              >
                {isSaving ? 'Tracking...' : isSaved ? '✓ Added to Tracker' : 'Track Application'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-gray-100 divide-x divide-gray-100 bg-slate-50/50">
            <div className="p-4 text-center">
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Value / Amount</span>
              <span className="block text-lg font-bold text-gray-900 mt-1">{bursary.amount}</span>
            </div>
            <div className="p-4 text-center">
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Application Deadline</span>
              <span className="block text-lg font-bold text-rose-600 mt-1">
                {new Date(bursary.deadline).toLocaleDateString('en-KE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">About this Bursary</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{bursary.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Eligibility Criteria</h3>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-gray-700 leading-relaxed whitespace-pre-line">
                {bursary.eligibility_criteria}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Required Documents</h3>
              {bursary.documents_required && bursary.documents_required.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bursary.documents_required.map((doc, index) => (
                    <li key={index} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-700">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs shrink-0">
                        {index + 1}
                      </span>
                      {doc}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No specific documents listed.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}