import Link from 'next/link'

export default function OnboardingBrief() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-8 bg-[#FAFAF7]">
      <ProgressBar step={2} />

      <div className="flex-1 flex flex-col gap-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-900">Let's build your reconnect list</h1>

        <div className="bg-white rounded-3xl p-6 space-y-4 shadow-sm border border-gray-100 text-gray-700 leading-relaxed text-sm">
          <p>
            HelloAgain works best for people you genuinely care about but don't see as often as you'd like.
          </p>
          <p>
            Think of the <strong>second ring</strong>: a friend from business school, an old colleague, a neighbor from your last place. People who were meaningful, and still are.
          </p>
          <p>
            We recommend starting with <strong>5 to 10 people</strong> — not your closest friends (you're already seeing them), but the ones you keep meaning to reconnect with.
          </p>
        </div>

        <div className="bg-[#f0faf4] rounded-3xl p-5 border border-[#2D6A4F]/10">
          <p className="text-[#2D6A4F] text-sm font-medium leading-relaxed">
            💡 HelloAgain handles everything after you pick: scheduling, venue selection, even the reservation. You just approve the nudge.
          </p>
        </div>
      </div>

      <Link
        href="/onboarding/sync"
        className="block w-full bg-[#2D6A4F] text-white font-semibold py-4 rounded-2xl text-center active:scale-[0.98] transition-all mt-6"
      >
        Choose from my contacts →
      </Link>
    </main>
  )
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#2D6A4F]' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}
