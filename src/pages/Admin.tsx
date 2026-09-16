import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import {
  ChevronDown, ChevronUp, Plus, ExternalLink, Loader2, X,
  Users, Sparkles, Bell, CheckCircle2, Building2, ArrowLeft,
  AlertTriangle, Lightbulb, Brain, Target,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'pitocomeuc@gmail.com'

interface Company {
  id: string; name: string; sector: string; health_score: number; created_at: string
  owner_name: string; owner_email: string
}
interface Task {
  id: string; company_id: string; title: string; priority: string
  status: string; methodology: string; impact: string; created_at: string
}
interface Answer { company_id: string; question: string; answer: string }
interface Solution {
  id: string; company_id: string; title: string; description: string
  type: string; access_url: string; is_active: boolean; created_at: string
}
interface AiMemory {
  id: string; company_id: string; type: string; category: string
  fact: string; confidence: string; time_estimate: string; financial_impact: string
  status: string; created_at: string
}

type EventType = 'new_client' | 'new_plan' | 'solution'
interface FeedEvent {
  id: string; type: EventType; title: string; subtitle: string
  created_at: string; company_id: string; seen: boolean
}

const solutionTypes = [
  { id: 'automacao', label: '⚡ Automação' },
  { id: 'documento', label: '📄 Documento' },
  { id: 'planilha', label: '📊 Planilha' },
  { id: 'template', label: '📋 Template' },
  { id: 'checklist', label: '✅ Checklist' },
  { id: 'other', label: '🔧 Outro' },
]

const sectorEmojis: Record<string, string> = {
  restaurante: '🍽️', bar: '🍺', loja_fisica: '🏪', loja_online: '🛒',
  clinica: '🏥', oficina: '🔧', escritorio: '💼', outro: '🏢',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d atrás`
  if (h > 0) return `${h}h atrás`
  if (m > 0) return `${m}min atrás`
  return 'agora'
}

function SolutionForm({ companyId, companyName, onSave, onClose }: {
  companyId: string; companyName: string
  onSave: (s: Solution) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ title: '', description: '', type: 'automacao', access_url: '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Título obrigatório'); return }
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/admin-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ company_id: companyId, ...form }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      toast.success('Solução liberada!')
      onSave(data)
    } catch {
      toast.error('Erro ao criar solução')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 pb-6">
      <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-lg p-5 space-y-3 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-white font-semibold">Nova Solução</h3>
            <p className="text-xs text-slate-500">Para: {companyName}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <input
          className="w-full bg-[#2A2A3E] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Título (ex: App de Pedidos Online)"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full bg-[#2A2A3E] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          placeholder="O que foi entregue e como usar..."
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          {solutionTypes.map(t => (
            <button key={t.id} onClick={() => setForm({ ...form, type: t.id })}
              className={cn('text-xs py-2 px-2 rounded-xl border transition-all text-center',
                form.type === t.id ? 'bg-indigo-500/20 border-indigo-500/60 text-white' : 'bg-[#2A2A3E] border-white/8 text-slate-400'
              )}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="w-full bg-[#2A2A3E] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Link de acesso (URL)"
          value={form.access_url}
          onChange={e => setForm({ ...form, access_url: e.target.value })}
        />
        <button onClick={handleSave} disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50">
          {loading ? 'Salvando...' : '🚀 Liberar para o Cliente'}
        </button>
      </div>
    </div>
  )
}

function CompanyCard({ company, tasks, answers, solutions, memories, onAddSolution }: {
  company: Company; tasks: Task[]; answers: Answer[]
  solutions: Solution[]; memories: AiMemory[]; onAddSolution: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const problemas = memories.filter(m => m.type === 'problema')
  const oportunidades = memories.filter(m => m.type === 'oportunidade')
  const contexto = memories.filter(m => m.type === 'fato' || m.type === 'hipotese')
  const topProblem = problemas.find(p => p.confidence === 'alta') ?? problemas[0]

  return (
    <div className="bg-[#1A1A2E] rounded-2xl border border-white/8 overflow-hidden">
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg shrink-0">
          {sectorEmojis[company.sector] ?? '🏢'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{company.name}</p>
          <p className="text-slate-500 text-xs truncate">{company.owner_name} · {company.owner_email}</p>
          {topProblem && !expanded && (
            <p className="text-rose-400 text-[11px] mt-1 line-clamp-1">⚠ {topProblem.fact}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            {problemas.length > 0 && (
              <span className="bg-rose-500/15 text-rose-400 text-[10px] px-1.5 py-0.5 rounded-full">{problemas.length} dores</span>
            )}
            {solutions.length > 0 && (
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full">{solutions.length}✓</span>
            )}
          </div>
          {expanded ? <ChevronUp size={14} className="text-slate-600 mt-1" /> : <ChevronDown size={14} className="text-slate-600 mt-1" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-4">

          {/* Dores / Problemas */}
          {problemas.length > 0 && (
            <div>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertTriangle size={10} /> Dores Identificadas ({problemas.length})
              </p>
              <div className="space-y-2">
                {problemas.map(m => (
                  <div key={m.id} className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-white leading-snug">{m.fact}</p>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5',
                        m.confidence === 'alta' ? 'bg-rose-500/20 text-rose-300' :
                        m.confidence === 'media' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-500/20 text-slate-400'
                      )}>{m.confidence}</span>
                    </div>
                    {m.financial_impact && (
                      <p className="text-[10px] text-rose-300 mt-1.5">💸 {m.financial_impact}</p>
                    )}
                    {m.category && m.category !== 'geral' && (
                      <p className="text-[10px] text-slate-500 mt-0.5">📂 {m.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Oportunidades */}
          {oportunidades.length > 0 && (
            <div>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Lightbulb size={10} /> Oportunidades ({oportunidades.length})
              </p>
              <div className="space-y-1.5">
                {oportunidades.map(m => (
                  <div key={m.id} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5">
                    <p className="text-xs text-white leading-snug">{m.fact}</p>
                    {m.financial_impact && (
                      <p className="text-[10px] text-amber-300 mt-1">📈 {m.financial_impact}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soluções entregues */}
          {solutions.length > 0 && (
            <div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide mb-2">Soluções Entregues</p>
              {solutions.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium">{s.title}</p>
                    {s.description && <p className="text-[10px] text-slate-400">{s.description}</p>}
                  </div>
                  {s.access_url && (
                    <a href={s.access_url} target="_blank" rel="noreferrer">
                      <ExternalLink size={13} className="text-emerald-400" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contexto IA (fatos e hipóteses) */}
          {contexto.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Brain size={10} /> Contexto IA ({contexto.length})
              </p>
              <div className="space-y-1">
                {contexto.slice(0, 5).map(m => (
                  <p key={m.id} className="text-[11px] text-slate-400 leading-snug">· {m.fact}</p>
                ))}
                {contexto.length > 5 && (
                  <p className="text-[10px] text-slate-600">+{contexto.length - 5} mais</p>
                )}
              </div>
            </div>
          )}

          {/* Diagnóstico onboarding (fallback se sem memórias) */}
          {memories.length === 0 && answers.length > 0 && (
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide mb-2">Diagnóstico Inicial</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {answers.map((a, i) => (
                  <div key={i} className="bg-[#2A2A3E] rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">{a.question}</p>
                    <p className="text-xs text-slate-200">{a.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planos antigos da IA */}
          {tasks.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mb-1.5">Planos da IA ({tasks.length})</p>
              <div className="space-y-1">
                {tasks.slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-start gap-2 bg-[#2A2A3E]/60 rounded-lg p-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1.5',
                      t.priority === 'alta' ? 'bg-red-400' : t.priority === 'media' ? 'bg-amber-400' : 'bg-emerald-400'
                    )} />
                    <p className="text-[11px] text-slate-400">{t.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onAddSolution}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-indigo-500/40 text-indigo-400 text-sm hover:bg-indigo-500/5 transition-all">
            <Plus size={14} /> Criar e Liberar Solução
          </button>
        </div>
      )}
    </div>
  )
}

// ── Aggregate pain/opportunities view ────────────────────────────────────────
function DoresView({ companies, memories }: { companies: Company[]; memories: AiMemory[] }) {
  const [filter, setFilter] = useState<'todos' | 'problema' | 'oportunidade'>('todos')

  const filtered = memories
    .filter(m => m.type === 'problema' || m.type === 'oportunidade')
    .filter(m => filter === 'todos' || m.type === filter)
    .sort((a, b) => {
      const order: Record<string, number> = { alta: 0, media: 1, baixa: 2 }
      return (order[a.confidence] ?? 2) - (order[b.confidence] ?? 2)
    })

  const totalDores = memories.filter(m => m.type === 'problema').length
  const totalOps = memories.filter(m => m.type === 'oportunidade').length

  if (memories.filter(m => m.type === 'problema' || m.type === 'oportunidade').length === 0) {
    return (
      <div className="text-center py-16">
        <Target size={32} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Nenhuma inteligência acumulada ainda.</p>
        <p className="text-slate-600 text-xs mt-1">À medida que os clientes conversam com a IA,<br/>os problemas e oportunidades aparecem aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-2">
        {([
          { key: 'todos', label: `Todos (${totalDores + totalOps})` },
          { key: 'problema', label: `Dores (${totalDores})` },
          { key: 'oportunidade', label: `Ops (${totalOps})` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={cn('text-xs px-3 py-1.5 rounded-full border transition-all',
              filter === f.key
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-white/4 border-white/8 text-slate-500'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.map(m => {
        const company = companies.find(c => c.id === m.company_id)
        const isDor = m.type === 'problema'
        return (
          <div key={m.id} className={cn('rounded-xl border p-3',
            isDor ? 'bg-rose-500/5 border-rose-500/15' : 'bg-amber-500/5 border-amber-500/15'
          )}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('text-[9px] font-bold uppercase tracking-wide flex items-center gap-1',
                isDor ? 'text-rose-400' : 'text-amber-400'
              )}>
                {isDor ? <><AlertTriangle size={9} /> Dor</> : <><Lightbulb size={9} /> Oportunidade</>}
              </span>
              <span className="text-[9px] text-slate-600">·</span>
              <span className="text-[9px] text-slate-400">
                {sectorEmojis[company?.sector ?? ''] ?? '🏢'} {company?.name ?? '—'}
              </span>
              {m.confidence === 'alta' && (
                <span className="ml-auto text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full">alta</span>
              )}
            </div>
            <p className="text-xs text-white leading-snug">{m.fact}</p>
            {m.financial_impact && (
              <p className="text-[10px] text-rose-300 mt-1.5">💸 {m.financial_impact}</p>
            )}
            {m.category && m.category !== 'geral' && (
              <p className="text-[10px] text-slate-500 mt-0.5">📂 {m.category}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed({ events, companies, onClickEvent }: {
  events: FeedEvent[]
  companies: Company[]
  onClickEvent: (companyId: string) => void
}) {
  const cfg = {
    new_client: { icon: Building2,    color: 'text-indigo-400', bg: 'bg-indigo-500/15', label: 'Novo cliente' },
    new_plan:   { icon: Sparkles,     color: 'text-amber-400',  bg: 'bg-amber-500/15',  label: 'Plano gerado' },
    solution:   { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Solução entregue' },
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <Bell size={28} className="text-slate-700 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">Nenhuma atividade ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map(ev => {
        const c = cfg[ev.type]
        const Icon = c.icon
        const company = companies.find(co => co.id === ev.company_id)
        return (
          <button
            key={ev.id}
            onClick={() => onClickEvent(ev.company_id)}
            className={cn(
              'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
              ev.seen ? 'bg-[#1A1A2E] border-white/6' : 'bg-indigo-500/5 border-indigo-500/20'
            )}
          >
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
              <Icon size={15} className={c.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-[9px] font-bold uppercase tracking-wide', c.color)}>{c.label}</span>
                {!ev.seen && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </div>
              <p className="text-xs text-white font-medium mt-0.5 leading-snug">{ev.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {sectorEmojis[company?.sector ?? ''] ?? '🏢'} {company?.name ?? ''} · {timeAgo(ev.created_at)}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main Admin ───────────────────────────────────────────────────────────────
type Tab = 'feed' | 'clientes' | 'dores'

export function Admin() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('clientes')
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [memories, setMemories] = useState<AiMemory[]>([])
  const [addingFor, setAddingFor] = useState<{ id: string; name: string } | null>(null)
  const [focusedCompany, setFocusedCompany] = useState<string | null>(null)
  const seenRef = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem('admin_seen') ?? '[]')))

  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return
    loadData()

    const companySub = supabase
      .channel('admin-companies')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'companies' }, (payload) => {
        const c = payload.new as Company
        setCompanies(prev => [c, ...prev])
        toast.custom((t) => (
          <div className={`bg-[#1E1E2E] border border-indigo-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <Building2 size={16} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">Novo cliente!</p>
              <p className="text-slate-400 text-xs">{c.name}</p>
            </div>
          </div>
        ))
      })
      .subscribe()

    const memorySub = supabase
      .channel('admin-memories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_memories' }, (payload) => {
        const m = payload.new as AiMemory
        if (m.status === 'ativo') {
          setMemories(prev => [m, ...prev])
          if (m.type === 'problema') {
            toast.custom((t) => (
              <div className={`bg-[#1E1E2E] border border-rose-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Nova dor identificada</p>
                  <p className="text-slate-400 text-xs truncate max-w-[200px]">{m.fact}</p>
                </div>
              </div>
            ))
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(companySub)
      supabase.removeChannel(memorySub)
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/admin-data', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      const data = await r.json()
      setCompanies(data.companies ?? [])
      setTasks(data.tasks ?? [])
      setAnswers(data.answers ?? [])
      setSolutions(data.solutions ?? [])
      setMemories(data.memories ?? [])
    } catch {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const buildFeed = (): FeedEvent[] => {
    const events: FeedEvent[] = [
      ...companies.map(c => ({
        id: `client-${c.id}`, type: 'new_client' as EventType,
        title: `${c.name} se cadastrou`, subtitle: c.owner_email,
        created_at: c.created_at, company_id: c.id,
        seen: seenRef.current.has(`client-${c.id}`),
      })),
      ...tasks.map(t => ({
        id: `task-${t.id}`, type: 'new_plan' as EventType,
        title: t.title, subtitle: t.methodology ?? '',
        created_at: t.created_at, company_id: t.company_id,
        seen: seenRef.current.has(`task-${t.id}`),
      })),
      ...solutions.map(s => ({
        id: `sol-${s.id}`, type: 'solution' as EventType,
        title: s.title, subtitle: s.type,
        created_at: s.created_at, company_id: s.company_id,
        seen: seenRef.current.has(`sol-${s.id}`),
      })),
    ]
    return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const markAllSeen = () => {
    const feed = buildFeed()
    feed.forEach(ev => seenRef.current.add(ev.id))
    localStorage.setItem('admin_seen', JSON.stringify([...seenRef.current]))
  }

  const handleEventClick = (companyId: string) => {
    setFocusedCompany(companyId)
    setTab('clientes')
    markAllSeen()
  }

  if (user?.email !== ADMIN_EMAIL) return null

  const feed = buildFeed()
  const unseen = feed.filter(e => !e.seen).length
  const totalDores = memories.filter(m => m.type === 'problema').length
  const totalOps = memories.filter(m => m.type === 'oportunidade').length

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0A0A15]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-3 border-b border-white/6" style={{ background: 'linear-gradient(135deg,rgba(108,99,255,0.12),rgba(79,70,229,0.06))' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/perfil')} className="text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Central de Inteligência</p>
            <h1 className="text-lg font-bold text-white leading-tight">ProcessAI</h1>
          </div>
          <button onClick={loadData} className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-indigo-400">{companies.length}</p>
            <p className="text-[9px] text-slate-500">Clientes</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-rose-400">{totalDores}</p>
            <p className="text-[9px] text-slate-500">Dores</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-amber-400">{totalOps}</p>
            <p className="text-[9px] text-slate-500">Ops</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{solutions.length}</p>
            <p className="text-[9px] text-slate-500">Soluções</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-white/6 px-3">
        <button
          onClick={() => { setTab('feed'); markAllSeen() }}
          className={cn('flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-all -mb-px',
            tab === 'feed' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-500'
          )}
        >
          <Bell size={13} />
          Feed
          {unseen > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unseen > 9 ? '9+' : unseen}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('clientes')}
          className={cn('flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-all -mb-px',
            tab === 'clientes' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-500'
          )}
        >
          <Users size={13} />
          Clientes ({companies.length})
        </button>
        <button
          onClick={() => setTab('dores')}
          className={cn('flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-all -mb-px',
            tab === 'dores' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-500'
          )}
        >
          <Target size={13} />
          Dores
          {totalDores > 0 && (
            <span className="text-[9px] text-rose-400">({totalDores})</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="text-indigo-400 animate-spin" />
          </div>
        ) : tab === 'feed' ? (
          <ActivityFeed events={feed} companies={companies} onClickEvent={handleEventClick} />
        ) : tab === 'dores' ? (
          <DoresView companies={companies} memories={memories} />
        ) : (
          <div className="space-y-3">
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Users size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Nenhum cliente cadastrado ainda.</p>
              </div>
            ) : companies.map(company => (
              <div
                key={company.id}
                ref={el => {
                  if (focusedCompany === company.id && el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setFocusedCompany(null)
                  }
                }}
              >
                <CompanyCard
                  company={company}
                  tasks={tasks.filter(t => t.company_id === company.id)}
                  answers={answers.filter(a => a.company_id === company.id)}
                  solutions={solutions.filter(s => s.company_id === company.id)}
                  memories={memories.filter(m => m.company_id === company.id)}
                  onAddSolution={() => setAddingFor({ id: company.id, name: company.name })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {addingFor && (
        <SolutionForm
          companyId={addingFor.id}
          companyName={addingFor.name}
          onSave={(s) => { setSolutions(prev => [s, ...prev]); setAddingFor(null) }}
          onClose={() => setAddingFor(null)}
        />
      )}
    </div>
  )
}
