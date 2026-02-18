
```js
import { supabaseAdmin } from '../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, responses } = req.body

  const { data: survey, error: fetchErr } = await supabaseAdmin
    .from('surveys').select('candidate_name, admin_email, role').eq('id', id).single()
  if (fetchErr) return res.status(500).json({ error: fetchErr.message })

  const { error: updateErr } = await supabaseAdmin.from('surveys').update({
    responses: JSON.stringify(responses),
    status: 'completed',
    completed_at: new Date().toISOString()
  }).eq('id', id)
  if (updateErr) return res.status(500).json({ error: updateErr.message })

  const resultsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results/${id}`

  // Email admin
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: survey.admin_email,
      subject: `Survey completed: ${survey.candidate_name}`,
      html: `
        
          ✅ ${survey.candidate_name} has completed their survey
          Role assessed: ${survey.role}
          Click below to view the full Culture Index report. You'll need your admin PIN to unlock it.
          
            View Full Report →
          
          
            Save this link in your candidate tracking spreadsheet:
            ${resultsUrl}
          
        
      `
    })
  } catch (e) { console.error('Admin notify email failed:', e.message) }

  res.status(200).json({ ok: true })
}
```
