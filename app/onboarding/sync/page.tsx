'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ParsedContact {
  name: string
  phone: string
}

function parseVCards(content: string): ParsedContact[] {
  const contacts: ParsedContact[] = []
  const blocks = content.match(/BEGIN:VCARD[\s\S]*?END:VCARD/gi) || []

  for (const block of blocks) {
    // Unfold long lines (RFC 6350: lines starting with space/tab are continuations)
    const unfolded = block.replace(/\r?\n[ \t]/g, '')
    const lines = unfolded.split(/\r?\n/)

    let name = ''
    let phone = ''

    for (const line of lines) {
      const t = line.trim()

      if (!name && t.startsWith('FN:')) {
        name = t.slice(3).trim()
      }
      if (!name && t.match(/^N:/)) {
        const parts = t.slice(2).split(';')
        name = [parts[1], parts[0]].filter(Boolean).join(' ').trim()
      }
      if (!phone && t.match(/^TEL/i)) {
        const match = t.match(/:(.+)$/)
        if (match) {
          let raw = match[1].trim().replace(/[\s\-.()]/g, '')
          if (raw.length >= 10) {
            if (!raw.startsWith('+')) raw = raw.length === 10 ? `+1${raw}` : `+${raw}`
            phone = raw
          }
        }
      }
    }

    if (name && phone) contacts.push({ name, phone })
  }

  // Deduplicate by phone
  const seen = new Set<string>()
  return contacts.filter((c) => {
    if (seen.has(c.phone)) return false
    seen.add(c.phone)
    return true
  })
}

export default function SyncContactsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done'>('idle')
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.vcf') && file.type !== 'text/vcard' && file.type !== 'text/x-vcard') {
      setError('Please upload a .vcf file.')
      return
    }
    setStatus('parsing')
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const contacts = parseVCards(content)
      if (contacts.length === 0) {
        setError("Couldn't read any contacts from that file. Try exporting again.")
        setStatus('idle')
        return
      }
      sessionStorage.setItem('icloudContacts', JSON.stringify(contacts))
      setCount(contacts.length)
      setStatus('done')
    }
    reader.onerror = () => {
      setError('Could not read the file. Please try again.')
      setStatus('idle')
    }
    reader.readAsText(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 bg-[#FAFAF7]">
      <ProgressBar step={3} />

      <div className="flex-1 flex flex-col gap-5 mt-6">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#f0faf4] text-[#2D6A4F] text-xs font-medium px-3 py-1 rounded-full mb-3">
            ✓ One-time step — takes about 60 seconds
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Import your contacts</h1>
          <p className="text-gray-500 mt-1 text-sm leading-relaxed">
            Your contacts live in iCloud. Export them once and HelloAgain will remember them — you'll never need to do this again.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          {[
            {
              n: 1,
              text: 'Tap the button below — iCloud Contacts opens in a new tab',
            },
            {
              n: 2,
              text: 'Sign in if asked, then press Cmd+A (Mac) or tap ⊙ → Select All to select all contacts',
            },
            {
              n: 3,
              text: 'Click the gear icon (⚙) at the bottom left → Export vCard',
            },
            {
              n: 4,
              text: 'Come back to this tab and upload the downloaded file below',
            },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{step.n}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Open iCloud button */}
        <a
          href="https://www.icloud.com/contacts"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 font-medium py-3.5 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
        >
          <span>☁️</span>
          <span>Open iCloud Contacts</span>
          <span className="text-gray-400 text-xs ml-1">↗</span>
        </a>

        {/* File upload zone */}
        {status !== 'done' ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center gap-3 cursor-pointer active:bg-gray-50 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,text/vcard,text/x-vcard"
              onChange={onFileChange}
              className="hidden"
            />
            {status === 'parsing' ? (
              <>
                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#2D6A4F] rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Reading your contacts...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">📎</div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Tap to upload your contacts file</p>
                  <p className="text-xs text-gray-400 mt-0.5">The .vcf file you exported from iCloud</p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Success state */
          <div className="bg-[#f0faf4] border border-[#2D6A4F]/20 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] flex items-center justify-center text-white text-xl flex-shrink-0">✓</div>
            <div>
              <p className="font-semibold text-gray-900">{count} contacts imported</p>
              <p className="text-sm text-gray-500 mt-0.5">Ready to pick who to reconnect with</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      {/* CTAs */}
      <div className="space-y-3 mt-6">
        {status === 'done' ? (
          <button
            onClick={() => router.push('/onboarding/contacts')}
            className="w-full bg-[#2D6A4F] text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-all"
          >
            Choose who to reconnect with →
          </button>
        ) : (
          <button
            onClick={() => router.push('/onboarding/contacts')}
            className="w-full text-center text-sm text-gray-400 py-2"
          >
            Skip — my contacts are already in Google
          </button>
        )}
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
