import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const TIER_STYLE: Record<string, { label: string; emoji: string; color: string }> = {
  warm:      { label: 'Monthly',      emoji: '🌱', color: 'bg-emerald-100 text-emerald-700' },
  friendly:  { label: 'Quarterly',    emoji: '☀️', color: 'bg-amber-100 text-amber-700' },
  keep_warm: { label: 'Twice a year', emoji: '🌙', color: 'bg-purple-100 text-purple-700' },
}

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('name, city')
    .eq('id', user.id)
    .single()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('next_nudge_date', { ascending: true })

  const firstName = profile?.name?.split(' ')[0] || 'there'

  return (
    <main className="min-h-screen bg-[#FAFAF7] pb-10">

      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-[#FAFAF7]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Good to see you,</p>
            <h1 className="text-2xl font-bold text-gray-900">{firstName} 👋</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#2D6A4F] flex items-center justify-center">
            <span className="text-white text-sm font-bold">{firstName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Nudges placeholder (Week 2) */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💬</span>
            <h2 className="font-semibold text-gray-900 text-sm">Your nudges</h2>
          </div>
          <p className="text-sm text-gray-400 text-center py-4">
            Nudges coming soon — we'll text you when it's time to reach out.
          </p>
        </div>
      </div>

      {/* Contact list */}
      <div className="px-6">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">
          Reconnect list ({contacts?.length ?? 0})
        </h2>

        {contacts && contacts.length > 0 ? (
          <div className="space-y-2.5">
            {contacts.map((c) => {
              const tier = TIER_STYLE[c.tier] ?? TIER_STYLE.friendly
              const nextNudge = c.next_nudge_date
                ? new Date(c.next_nudge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '—'

              return (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-400">Next nudge: {nextNudge}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${tier.color}`}>
                    {tier.emoji} {tier.label}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">No contacts yet.</div>
        )}
      </div>
    </main>
  )
}
