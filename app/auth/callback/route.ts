import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this user already has a profile row
      const { data: existingUser } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        // New user — create their profile row and send to onboarding
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || '',
        })
        return NextResponse.redirect(new URL('/onboarding', origin))
      }

      // Existing user — resume where they left off
      return NextResponse.redirect(new URL(
        existingUser.onboarding_completed ? '/home' : '/onboarding',
        origin
      ))
    }
  }

  // Auth failed — back to splash with error param
  return NextResponse.redirect(new URL('/?error=auth_failed', origin))
}
