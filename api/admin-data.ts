import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'pitocomeuc@gmail.com'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  // Verify with anon key first (to get user email)
  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY)
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Use service role if available (sees all companies), else use admin JWT via RLS
  const supabase = SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY)
    : createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } })

  try {
    // All companies with owners
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (!companies) return res.json({ companies: [], tasks: [], answers: [] })

    const companyIds = companies.map((c: { id: string }) => c.id)

    const [{ data: tasks }, { data: answers }, { data: solutions }, { data: memories }] = await Promise.all([
      supabase.from('improvement_tasks').select('*').in('company_id', companyIds).order('created_at', { ascending: false }),
      supabase.from('onboarding_answers').select('*').in('company_id', companyIds),
      supabase.from('solutions').select('*').in('company_id', companyIds).order('created_at', { ascending: false }),
      supabase.from('ai_memories').select('*').in('company_id', companyIds).eq('status', 'ativo').order('created_at', { ascending: false }),
    ])

    // Enrich companies with owner email via auth.users
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
    const userMap: Record<string, { email: string; name: string }> = {}
    if (authUsers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authUsers.forEach((u: any) => {
        userMap[u.id] = { email: u.email ?? '', name: u.user_metadata?.name ?? u.email?.split('@')[0] ?? '' }
      })
    }

    const enrichedCompanies = companies.map((c: { owner_id: string }) => ({
      ...c,
      owner_email: userMap[c.owner_id]?.email ?? '',
      owner_name: userMap[c.owner_id]?.name ?? '',
    }))

    res.json({ companies: enrichedCompanies, tasks: tasks ?? [], answers: answers ?? [], solutions: solutions ?? [], memories: memories ?? [] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
