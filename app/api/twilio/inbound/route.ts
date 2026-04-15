import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '@/lib/twilio/client'

// Simple vCard parser — handles standard .vcf files shared from iOS / Android
function parseVCard(text: string): { name: string; phone: string } | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  let name = ''
  let phone = ''

  for (const line of lines) {
    if (!name && line.startsWith('FN:')) {
      name = line.slice(3).trim()
    }
    if (!name && line.startsWith('N:')) {
      const parts = line.slice(2).split(';')
      name = [parts[1], parts[0]].filter(Boolean).join(' ').trim()
    }
    if (!phone && line.startsWith('TEL')) {
      const match = line.match(/:(.+)$/)
      if (match) {
        let raw = match[1].trim().replace(/[\s\-().]/g, '')
        if (!raw.startsWith('+')) raw = raw.length === 10 ? `+1${raw}` : `+${raw}`
        phone = raw
      }
    }
  }

  return name && phone ? { name, phone } : null
}

export async function POST(request: Request) {
  const form = await request.formData()
  const from         = form.get('From') as string
  const body         = (form.get('Body') as string | null) ?? ''
  const numMedia     = parseInt((form.get('NumMedia') as string) ?? '0', 10)
  const mediaUrl     = form.get('MediaUrl0') as string | null
  const mediaType    = (form.get('MediaContentType0') as string | null) ?? ''

  // Use service role client — no user session on incoming webhook
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find the HelloAgain user by their phone number
  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('phone', from)
    .single()

  const twimlEmpty = new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })

  if (!user) {
    await sendSMS(from, "Hi! I don't recognise this number. Sign up at your HelloAgain link to get started.")
    return twimlEmpty
  }

  // ── Contact card (.vcf) shared via SMS/WhatsApp ──
  if (numMedia > 0 && mediaUrl && (mediaType.includes('vcard') || mediaType.includes('vcf'))) {
    try {
      const vcfRes = await fetch(mediaUrl, {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        },
      })
      const vcfText = await vcfRes.text()
      const parsed = parseVCard(vcfText)

      if (!parsed) {
        await sendSMS(from, "I couldn't read that contact card. Try sharing it again.")
        return twimlEmpty
      }

      // Check for duplicate
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('phone', parsed.phone)
        .single()

      if (existing) {
        await sendSMS(from, `${parsed.name} is already on your list!`)
        return twimlEmpty
      }

      const nextNudge = new Date()
      nextNudge.setDate(nextNudge.getDate() + 30)

      await supabase.from('contacts').insert({
        user_id: user.id,
        name: parsed.name,
        phone: parsed.phone,
        tier: 'friendly',
        next_nudge_date: nextNudge.toISOString().split('T')[0],
      })

      await sendSMS(
        from,
        `Got it! I've added ${parsed.name} to your list with a Friendly tier (monthly nudge). 🤝\n\nOpen the app to change their tier any time.`
      )
    } catch (err) {
      console.error('vCard error:', err)
      await sendSMS(from, "Something went wrong reading that contact card. Please try again.")
    }

    return twimlEmpty
  }

  // ── Text replies (future intent handling — stub for now) ──
  await sendSMS(
    from,
    `Hey! 👋 To add someone, share their contact card (as a .vcf) to this number. Or open the app to manage your list.`
  )

  return twimlEmpty
}
