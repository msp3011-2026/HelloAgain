import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignInButton from '@/components/SignInButton'

export default async function SplashPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    redirect(profile?.onboarding_completed ? '/home' : '/onboarding')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-14 bg-[#FAFAF7]">

      {/* Logo + headline */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 w-full max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-[#2D6A4F] flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold tracking-tight">HA</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">HelloAgain</h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Your personal assistant for staying in touch with people who matter.
          </p>
        </div>

        <div className="w-full space-y-4 mt-2">
          {[
            { icon: '💬', text: "Get nudged when it's time to reach out" },
            { icon: '📅', text: 'Scheduling handled — no back and forth' },
            { icon: '🍽️', text: 'Venue picked, reservation made' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-left bg-white rounded-2xl px-4 py-3 border border-gray-100">
              <span className="text-xl">{item.icon}</span>
              <p className="text-gray-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign in */}
      <div className="w-full max-w-sm space-y-4">
        {searchParams.error && (
          <p className="text-red-500 text-sm text-center">
            Something went wrong. Please try again.
          </p>
        )}
        <SignInButton />
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          HelloAgain uses your Google account to access your contacts and calendar. Your data is never shared.
        </p>
      </div>
    </main>
  )
}
