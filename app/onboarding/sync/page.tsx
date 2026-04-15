import Link from 'next/link'

export default function SyncContactsPage() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-8 bg-[#FAFAF7]">
      <ProgressBar step={3} />

      <div className="flex-1 flex flex-col gap-6 mt-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">One quick thing</h1>
          <p className="text-gray-500 mt-1 text-sm leading-relaxed">
            HelloAgain reads from Google Contacts. If your contacts live in your iPhone (iCloud), sync them to Google first so everyone shows up.
          </p>
        </div>

        {/* iPhone sync steps */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-gray-700">Sync iPhone contacts to Google (2 min)</p>

          {[
            { n: 1, text: 'Open your iPhone Settings app' },
            { n: 2, text: 'Scroll down and tap Contacts' },
            { n: 3, text: 'Tap Accounts → Add Account → Google' },
            { n: 4, text: 'Sign in with your Google account' },
            { n: 5, text: 'Make sure the Contacts toggle is turned on' },
            { n: 6, text: 'Wait 1–2 minutes, then come back here' },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{step.n}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Already synced note */}
        <div className="bg-[#f0faf4] rounded-2xl p-4 border border-[#2D6A4F]/10">
          <p className="text-[#2D6A4F] text-sm leading-relaxed">
            <strong>Already use Google Contacts?</strong> You're good — skip straight to the next step.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3 mt-6">
        <Link
          href="/onboarding/contacts"
          className="block w-full bg-[#2D6A4F] text-white font-semibold py-4 rounded-2xl text-center active:scale-[0.98] transition-all"
        >
          My contacts are synced →
        </Link>
        <Link
          href="/onboarding/contacts"
          className="block w-full text-center text-sm text-gray-400 py-2"
        >
          Skip — my contacts are already in Google
        </Link>
      </div>
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
