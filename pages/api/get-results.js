// Server-side only — safe to use service role key here
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing ID' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'Not found' })
  return res.status(200).json(data)
}