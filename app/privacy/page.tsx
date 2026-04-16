export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">What HelloAgain is</h2>
          <p>HelloAgain is a personal social assistant that helps you stay in touch with people who matter. We handle scheduling, venue suggestions, and reminders so you don't have to.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">What data we collect</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Your name, email address, and phone number</li>
            <li>Your city, for finding local venues</li>
            <li>Names and phone numbers of contacts you choose to add</li>
            <li>Your Google Calendar availability (read-only, to suggest meeting times)</li>
            <li>Food preferences and scheduling preferences you share with us</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">How we use your data</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>To send you timely nudges via SMS when it's time to reach out to someone</li>
            <li>To coordinate scheduling with the people you want to meet</li>
            <li>To suggest venues based on your location and preferences</li>
            <li>To improve HelloAgain over time</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">What we don't do</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>We never sell your data to third parties</li>
            <li>We never read your emails or messages</li>
            <li>We only access Google Calendar availability (free/busy) — not event details</li>
            <li>We don't share your information with advertisers</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Third-party services</h2>
          <p>HelloAgain uses Supabase (database and authentication), Twilio (SMS), Google APIs (contacts and calendar), and Anthropic Claude (AI). Each has their own privacy policy.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Your rights</h2>
          <p>You can delete your account and all associated data at any time by contacting us. You can also revoke Google access at any time from your Google Account settings.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
          <p>Questions? Email us at <a href="mailto:manasi.iit.madras@gmail.com" className="text-[#2D6A4F] underline">manasi.iit.madras@gmail.com</a></p>
        </section>
      </div>
    </main>
  )
}
