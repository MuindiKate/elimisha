'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Kenya's 47 counties
const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot'
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state — mirrors our profiles table exactly
  const [form, setForm] = useState({
    level_of_education: '',
    institution: '',
    course_of_study: '',
    year_of_study: '',
    county_of_origin: '',
    income_bracket: '',
    phone_number: '',
    notifications_email: true,
    notifications_sms: false,
  })

  // Generic change handler — updates any field by name
  // This way we don't need a separate handler for every input
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    // Get current logged in user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Update their profile row with the form data
    const { error } = await supabase
      .from('profiles')
      .update({
        level_of_education: form.level_of_education,
        institution: form.institution,
        course_of_study: form.course_of_study,
        year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null,
        county_of_origin: form.county_of_origin,
        income_bracket: form.income_bracket,
        phone_number: form.phone_number,
        notifications_email: form.notifications_email,
        notifications_sms: form.notifications_sms,
      })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Profile complete — send them to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Set up your profile
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            This helps us match you to bursaries you actually qualify for
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">

          {/* Level of education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level of education
            </label>
            <select
              name="level_of_education"
              value={form.level_of_education}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent bg-white"
            >
              <option value="">Select level</option>
              <option value="certificate">Certificate</option>
              <option value="diploma">Diploma</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input
              type="text"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="e.g. Strathmore University"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent"
            />
          </div>

          {/* Course of study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course of study
            </label>
            <input
              type="text"
              name="course_of_study"
              value={form.course_of_study}
              onChange={handleChange}
              placeholder="e.g. Bachelor of Business IT"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent"
            />
          </div>

          {/* Year of study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of study
            </label>
            <select
              name="year_of_study"
              value={form.year_of_study}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent bg-white"
            >
              <option value="">Select year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
              <option value="6">Year 6</option>
            </select>
          </div>

          {/* County of origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County of origin
            </label>
            <select
              name="county_of_origin"
              value={form.county_of_origin}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent bg-white"
            >
              <option value="">Select county</option>
              {KENYAN_COUNTIES.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>

          {/* Income bracket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Household income (KES/month)
            </label>
            <select
              name="income_bracket"
              value={form.income_bracket}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent bg-white"
            >
              <option value="">Select range</option>
              <option value="below_10k">Below KES 10,000</option>
              <option value="10k_50k">KES 10,000 – 50,000</option>
              <option value="50k_150k">KES 50,000 – 150,000</option>
              <option value="above_150k">Above KES 150,000</option>
            </select>
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number <span className="text-gray-400">(for SMS reminders)</span>
            </label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="e.g. 0712 345 678"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-transparent"
            />
          </div>

          {/* Notification preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications_email"
                  checked={form.notifications_email}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-green-600"
                />
                <span className="text-sm text-gray-700">
                  Email reminders before deadlines
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications_sms"
                  checked={form.notifications_sms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-green-600"
                />
                <span className="text-sm text-gray-700">
                  SMS reminders before deadlines
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 
            text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Saving...' : 'Complete profile →'}
          </button>

        </div>
      </div>
    </div>
  )
}