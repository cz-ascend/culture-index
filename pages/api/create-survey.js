
```js
import { supabaseAdmin } from '../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, name, email, role, adminEmail } = req.body

  const { error } = await supabaseAdmin.from('surveys').insert({
    id, candidate_name: name, candidate_email: email,
    role, admin_email: adminEmail, status: 'pending'
  })
  if (error) return res.status(500).json({ error: error.message })

  const base = process.env.NEXT_PUBLIC_BASE_URL
  const surveyUrl = `${base}/survey/${id}`
  const resultsUrl = `${base}/results/${id}`

  // Email candidate
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your Culture Index Survey',
      html: `
        
          Hi ${name},
          You've been invited to complete a short Culture Index survey. It takes approximately 10–15 minutes and covers how you naturally approach work, communication, and collaboration.
          There are no right or wrong answers — respond based on what feels most natural to you.
          
            Start Survey →
          
          If the button doesn't work: ${surveyUrl}
        
      `
    })
  } catch (e) { console.error('Invite email failed:', e.message) }

  res.status(200).json({ surveyUrl, resultsUrl })
}
```
