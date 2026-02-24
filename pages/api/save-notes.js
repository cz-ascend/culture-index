import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, notes } = req.body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabase
    .from('surveys')
    .update({ admin_notes: notes })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}