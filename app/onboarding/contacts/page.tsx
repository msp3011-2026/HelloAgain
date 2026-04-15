'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Contact {
  name: string
  phone: string
}

interface Selected extends Contact {
  id: string
}

export default function ContactsPage() {
  const router = useRouter()
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [filtered, setFiltered] = useState<Contact[]>([])
  const [selected, setSelected] = useState<Selected[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')

  useEffect(() => {
    fetch('/api/contacts/google')
      .then((r) => r.json())
      .then((data) => {
        if (data.contacts) {
          setAllContacts(data.contacts)
          setFiltered(data.contacts)
        } else {
          setLoadError('Could not load Google Contacts. You can still add people manually below.')
        }
      })
      .catch(() => setLoadError('Could not load Google Contacts. You can still add people manually below.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(allContacts)
    } else {
      const q = query.toLowerCase()
      setFiltered(allContacts.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)))
    }
  }, [query, allContacts])

  const isSelected = (phone: string) => selected.some((s) => s.phone === phone)

  const toggle = (c: Contact) => {
    if (isSelected(c.phone)) {
      setSelected((prev) => prev.filter((s) => s.phone !== c.phone))
    } else if (selected.length < 20) {
      setSelected((prev) => [...prev, { ...c, id: c.phone }])
    }
  }

  const addManual = () => {
    if (!manualName.trim() || !manualPhone.trim()) return
    const cleaned = manualPhone.replace(/\D/g, '')
    if (cleaned.length < 10) return
    const phone = cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`
    if (isSelected(phone)) return
    setSelected((prev) => [...prev, { id: `manual_${Date.now()}`, name: manualName.trim(), phone }])
    setManualName('')
    setManualPhone('')
    setShowManual(false)
  }

  const handleDone = () => {
    if (selected.length === 0) return
    sessionStorage.setItem('selectedContacts', JSON.stringify(selected))
    router.push('/onboarding/tiers')
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAF7]">

      {/* Sticky header */}
      <div className="px-6 pt-8 pb-3 sticky top-0 bg-[#FAFAF7] z-10 space-y-4">
        <ProgressBar step={3} />

        <div>
          <h1 className="text-xl font-bold text-gray-900">Who do you want to reconnect with?</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pick 5–10 people from your contacts.</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 gap-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your contacts..."
            className="flex-1 py-3.5 bg-transparent text-sm text-gray-900 focus:outline-none"
          />
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected((prev) => prev.filter((s) => s.id !== c.id))}
                className="flex items-center gap-1 bg-[#2D6A4F] text-white text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {c.name.split(' ')[0]}
                <span className="text-green-200 ml-0.5">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#2D6A4F] rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading your contacts...</p>
          </div>
        ) : loadError ? (
          <p className="text-gray-500 text-sm py-6 text-center">{loadError}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">No contacts found.</p>
        ) : (
          filtered.map((c) => {
            const sel = isSelected(c.phone)
            return (
              <button
                key={c.phone}
                onClick={() => toggle(c)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  sel ? 'bg-[#f0faf4] border-[#2D6A4F]' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    sel ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  sel ? 'bg-[#2D6A4F] border-[#2D6A4F]' : 'border-gray-300'
                }`}>
                  {sel && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })
        )}

        {/* Manual add */}
        {!showManual ? (
          <button
            onClick={() => setShowManual(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm"
          >
            <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg">+</span>
            Add someone not in your contacts
          </button>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Add manually</p>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <input
              type="tel"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowManual(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500">
                Cancel
              </button>
              <button onClick={addManual} disabled={!manualName || !manualPhone} className="flex-1 py-2.5 bg-[#2D6A4F] text-white rounded-xl text-sm font-medium disabled:opacity-40">
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-8 pt-4 border-t border-gray-100 bg-[#FAFAF7]">
        <button
          onClick={handleDone}
          disabled={selected.length === 0}
          className="w-full bg-[#2D6A4F] text-white font-semibold py-4 rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {selected.length === 0
            ? 'Select at least one person'
            : `Continue with ${selected.length} ${selected.length === 1 ? 'person' : 'people'} →`}
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
