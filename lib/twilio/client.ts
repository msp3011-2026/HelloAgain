import twilio from 'twilio'

export function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
}

export async function sendSMS(to: string, body: string) {
  const client = getTwilioClient()
  return client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
    body,
  })
}
