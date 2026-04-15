'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CITIES = [
  { value: 'nyc', label: 'New York City' },
  { value: 'sf', label: 'San Francisco' },
  { value: 'la', label: 'Los Angeles' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'london', label: 'London' },
  { value: 'other', label: 'Other' },
]

export default function OnboardingCityPhone() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    setError('')
    if (!city) { setError('Please select your city.'); return }
    if (!phone) { setError('Please enter your phone number.'); return }

    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Please enter a valid phone number.'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error: dbError } = await supabase
      .from('users')
      .update({ city, phone: cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}` })
      .eq('id', user.id)

    if (dbError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/onboarding/brief')
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 bg-[#FAFAF7]">
      <ProgressBar step={1} />

      <div className="flex-1 flex flex-col gap-8 mt-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A few quick things</h1>
          <p className="text-gray-500 mt-1">We need your city and phone to get started.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your city</label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              >
                <option value="">Select your city...</option>
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your phone number</label>
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#2D6A4F]">
              <span className="px-4 text-gray-500 text-sm border-r border-gray-200 py-4 whitespace-nowrap">🇺🇸 +1</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(212) 555-0100"
                className="flex-1 px-4 py-4 bg-transparent text-gray-900 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400">We'll send nudges and updates here via SMS.</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        disabled={loading || !city || !phone}
        className="w-full bg-[#2D6A4F] text-white font-semibold py-4 rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all mt-6"
      >
        {loading ? 'Saving...' : 'Continue →'}
      </button>
    </main>
  )
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#2D6A4F]' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}
