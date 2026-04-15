import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio/client'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('name, phone')
    .eq('id', user.id)
    .single()

  if (!profile?.phone) return NextResponse.json({ error: 'No phone number on file' }, { status: 400 })

  const firstName = profile.name?.split(' ')[0] || 'there'

  const message =
    `Hey ${firstName}! 👋 I'm HelloAgain — your personal social assistant.\n\n` +
    `I'll remind you when it's time to reach out to someone, and take care of all the planning: scheduling, venue selection, even the reservation.\n\n` +
    `Save this number so you always know it's me. Your reconnect list is ready 🎉`

  try {
    await sendSMS(profile.phone, message)
  } catch (err) {
    // Non-fatal — log and continue
    console.error('Welcome SMS failed:', err)
  }

  return NextResponse.json({ success: true })
}
