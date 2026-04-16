export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Using HelloAgain</h2>
          <p>HelloAgain is currently in private beta. By using HelloAgain, you agree to use it for personal, non-commercial purposes — specifically to help you maintain real-world relationships.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Your account</h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>You are responsible for keeping your account secure</li>
            <li>You must provide accurate information (name, phone number, city)</li>
            <li>You must be 18 or older to use HelloAgain</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">SMS messaging</h2>
          <p>By providing your phone number, you consent to receive SMS messages from HelloAgain including nudges, scheduling updates, and confirmations. Standard message and data rates may apply. You can opt out at any time by replying STOP.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Adding contacts</h2>
          <p>When you add someone to HelloAgain, they may receive SMS messages as part of the scheduling flow. By adding a contact, you confirm you have a genuine personal relationship with them and their permission to include them in this process.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Availability</h2>
          <p>HelloAgain is provided as-is during beta. We may change, pause, or discontinue the service at any time. We are not liable for missed plans, scheduling errors, or any other outcomes.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
          <p>Questions? Email us at <a href="mailto:manasi.iit.madras@gmail.com" className="text-[#2D6A4F] underline">manasi.iit.madras@gmail.com</a></p>
        </section>
      </div>
    </main>
  )
}
