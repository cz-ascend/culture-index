import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, responses } = req.body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch survey record
  const { data: survey, error: fetchErr } = await supabase
    .from('surveys')
    .select('candidate_name, admin_email, role')
    .eq('id', id)
    .single()

  if (fetchErr) {
    console.error('Fetch error:', fetchErr)
    return res.status(500).json({ error: fetchErr.message })
  }

  // Save responses
  const { error: updateErr } = await supabase
    .from('surveys')
    .update({
      responses: JSON.stringify(responses),
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateErr) {
    console.error('Update error:', updateErr)
    return res.status(500).json({ error: updateErr.message })
  }

  const resultsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results/${id}`

  // Email admin
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: survey.admin_email,
      subject: `Survey completed: ${survey.candidate_name}`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9fafb">
        <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <h2 style="color:#1e3a5f;margin-top:0">✅ ${survey.candidate_name} has completed their survey</h2>
          <p style="color:#374151">Role assessed: <strong>${survey.role}</strong></p>
          <p style="color:#374151;line-height:1.6">Click below to view the full Culture Index report. You will need your admin PIN to unlock it.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${resultsUrl}" style="background:#1e3a5f;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">View Full Report →</a>
          </div>
          <div style="background:#f8fafc;border-radius:10px;padding:14px;margin-top:16px">
            <p style="font-size:12px;color:#6b7280;margin:0">Save this link in your candidate tracking spreadsheet:</p>
            <p style="font-size:12px;color:#4f46e5;margin:4px 0 0;word-break:break-all">${resultsUrl}</p>
          </div>
        </div>
      </div>`
    })
  } catch (e) {
    console.error('Email error:', e.message)
  }

  return res.status(200).json({ ok: true })
}
