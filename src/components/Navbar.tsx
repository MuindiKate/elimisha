'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Helper to highlight active nav link
  function isActive(path: string) {
    return pathname === path
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-4 sticky 
    top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard"
          className="text-lg font-bold text-green-600 hover:text-green-700">
          Elimisha
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Home' },
            { href: '/bursaries', label: 'Browse' },
            { href: '/applications', label: 'My Applications' },
            { href: '/onboarding', label: 'Profile' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive(link.href)
                ? 'bg-green-50 text-green-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm text-gray-400 hover:text-red-500 
          transition-colors font-medium disabled:opacity-50"
        >
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </nav>
  )
}