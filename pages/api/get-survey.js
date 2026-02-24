import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing survey ID' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('surveys')
    .select('id, candidate_name, status')
    .eq('id', id)
    .single()

  if (error) {
    console.error('DB fetch error:', error)
    return res.status(404).json({ error: 'Survey not found' })
  }

  return res.status(200).json(data)
}