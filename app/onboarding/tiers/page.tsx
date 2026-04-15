'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Contact { id: string; name: string; phone: string }
type Tier = 'warm' | 'friendly' | 'keep_warm'

const TIERS = [
  { value: 'warm' as Tier,       emoji: '🔥', label: 'Warm',      desc: 'Every 2 wks',  days: 14,  active: 'bg-orange-400 border-orange-400 text-white',  idle: 'border-gray-100 text-gray-500 bg-gray-50' },
  { value: 'friendly' as Tier,   emoji: '🤝', label: 'Friendly',  desc: 'Monthly',      days: 30,  active: 'bg-blue-400 border-blue-400 text-white',     idle: 'border-gray-100 text-gray-500 bg-gray-50' },
  { value: 'keep_warm' as Tier,  emoji: '☀️', label: 'Keep warm', desc: 'Every 2 mo',   days: 60,  active: 'bg-yellow-400 border-yellow-400 text-white', idle: 'border-gray-100 text-gray-500 bg-gray-50' },
]

export default function TiersPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tiers, setTiers] = useState<Record<string, Tier>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedContacts')
    if (!stored) { router.push('/onboarding/contacts'); return }
    const parsed = JSON.parse(stored) as Contact[]
    setContacts(parsed)
    // Default everyone to friendly
    const defaults: Record<string, Tier> = {}
    parsed.forEach((c) => { defaults[c.id] = 'friendly' })
    setTiers(defaults)
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const today = new Date()
    const rows = contacts.map((c) => {
      const tier = tiers[c.id] || 'friendly'
      const days = TIERS.find((t) => t.value === tier)?.days ?? 30
      const next = new Date(today)
      next.setDate(today.getDate() + days)
      return { user_id: user.id, name: c.name, phone: c.phone, tier, next_nudge_date: next.toISOString().split('T')[0] }
    })

    const { error: dbErr } = await supabase
      .from('contacts')
      .upsert(rows, { onConflict: 'user_id,phone' })

    if (dbErr) {
      setError('Could not save contacts. Please try again.')
      setSaving(false)
      return
    }

    await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id)

    // Send welcome SMS (fire-and-forget)
    fetch('/api/onboarding/complete', { method: 'POST' }).catch(() => {})

    sessionStorage.removeItem('selectedContacts')
    router.push('/home')
  }

  if (contacts.length === 0) return null

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAF7]">

      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <ProgressBar step={4} />
        <h1 className="text-xl font-bold text-gray-900 mt-6 mb-1">How often should we nudge you?</h1>
        <p className="text-sm text-gray-500">You can change this any time from the app.</p>
      </div>

      {/* Tier legend */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 bg-white rounded-2xl p-3 border border-gray-100">
          {TIERS.map((t) => (
            <div key={t.value} className="flex-1 text-center py-1">
              <div className="text-lg">{t.emoji}</div>
              <div className="text-xs font-semibold text-gray-700 mt-0.5">{t.label}</div>
              <div className="text-xs text-gray-400">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{c.name}</span>
            </div>
            <div className="flex gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTiers((prev) => ({ ...prev, [c.id]: t.value }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    tiers[c.id] === t.value ? t.active : t.idle
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center px-6">{error}</p>}

      <div className="px-6 pb-8 pt-4 border-t border-gray-100 bg-[#FAFAF7]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#2D6A4F] text-white font-semibold py-4 rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {saving ? 'Setting up your list...' : "I'm ready →"}
        </button>
      </div>
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
