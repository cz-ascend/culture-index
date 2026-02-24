import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Check env vars are present — log any missing ones
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
    return res.status(500).json({ error: 'Missing Supabase configuration' })
  }
  if (!resendKey) {
    console.error('Missing RESEND_API_KEY')
  }
  if (!baseUrl) {
    console.error('Missing NEXT_PUBLIC_BASE_URL')
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
  const { id, name, email, role, adminEmail } = req.body

  // Save to database
  const { error: dbError } = await supabaseAdmin.from('surveys').insert({
    id,
    candidate_name: name,
    candidate_email: email,
    role,
    admin_email: adminEmail,
    status: 'pending'
  })

  if (dbError) {
    console.error('DB insert error:', dbError)
    return res.status(500).json({ error: dbError.message })
  }

  const surveyUrl = `${baseUrl}/survey/${id}`
  const resultsUrl = `${baseUrl}/results/${id}`

  // Send email
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: 'Your Culture Index Survey',
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:32px">
          <h2>Hi ${name},</h2>
          <p>You have been invited to complete a Culture Index survey. It takes approximately 10–15 minutes.</p>
          <p>There are no right or wrong answers — respond based on what feels most natural to you.</p>
          <p><a href="${surveyUrl}" style="background:#4f46e5;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Start Survey →</a></p>
          <p style="color:#9ca3af;font-size:12px">If the button doesn't work, copy this link: ${surveyUrl}</p>
        </div>`
      })
      console.log('Email send result:', JSON.stringify(emailResult))
    } catch (emailError) {
      console.error('Email error:', emailError.message)
      // Don't fail the whole request if email fails — just log it
    }
  }

  return res.status(200).json({ surveyUrl, resultsUrl })
}
