import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface GooglePerson {
  names?: { displayName: string }[]
  phoneNumbers?: { value: string; canonicalForm?: string }[]
}

export async function GET() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.provider_token) {
    return NextResponse.json(
      { error: 'No Google token. Please sign out and sign back in.' },
      { status: 401 }
    )
  }

  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers&pageSize=1000&sortOrder=FIRST_NAME_ASCENDING',
      { headers: { Authorization: `Bearer ${session.provider_token}` } }
    )

    if (!res.ok) {
      console.error('Google People API error:', res.status, await res.text())
      return NextResponse.json({ error: 'Failed to fetch from Google' }, { status: 502 })
    }

    const data = await res.json()

    const contacts = (data.connections ?? [])
      .map((p: GooglePerson) => ({
        name: p.names?.[0]?.displayName ?? '',
        phone: p.phoneNumbers?.[0]?.canonicalForm ?? p.phoneNumbers?.[0]?.value ?? '',
      }))
      .filter((c: { name: string; phone: string }) => c.name && c.phone)

    return NextResponse.json({ contacts })
  } catch (err) {
    console.error('Google Contacts error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
