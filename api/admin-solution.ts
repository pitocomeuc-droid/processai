import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'pitocomeuc@gmail.com'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  // Verify identity with anon key
  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY)
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Use service role if available, else admin JWT (admin owns all test companies via RLS)
  const supabase = SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY)
    : createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } })

  if (req.method === 'POST') {
    const { company_id, title, description, type, access_url } = req.body
    if (!company_id || !title) return res.status(400).json({ error: 'Missing fields' })

    const { data, error: dbError } = await supabase
      .from('solutions')
      .insert({ company_id, title, description, type: type ?? 'other', access_url, is_active: true })
      .select()
      .single()

    if (dbError) return res.status(500).json({ error: dbError.message })
    return res.json(data)
  }

  if (req.method === 'PATCH') {
    const { id, is_active } = req.body
    const { error: dbError } = await supabase
      .from('solutions')
      .update({ is_active })
      .eq('id', id)

    if (dbError) return res.status(500).json({ error: dbError.message })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
