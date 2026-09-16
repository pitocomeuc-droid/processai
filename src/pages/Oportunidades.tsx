import { useState, useEffect } from 'react'
import { TrendingUp, Clock, DollarSign, Zap, ArrowRight, Loader2, ChevronDown, ChevronUp, Target, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'alta' | 'media' | 'baixa'
  status: 'pendente' | 'em_andamento' | 'concluido'
  impact: string | null
  methodology: string | null
  created_at: string
}

const IMPACT: Record<string, { hours: number; brl: number }> = {
  alta: { hours: 40, brl: 3000 },
  media: { hours: 18, brl: 1200 },
  baixa: { hours: 6, brl: 400 },
}

const PRIORITY = {
  alta:  { label: 'Alto Impacto',  color: '#F43F5E', bg: 'bg-rose-500/8',   border: 'border-rose-500/15',   dot: 'bg-rose-400' },
  media: { label: 'Médio Impacto', color: '#F59E0B', bg: 'bg-amber-500/8',  border: 'border-amber-500/15',  dot: 'bg-amber-400' },
  baixa: { label: 'Baixo Impacto', color: '#10B981', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', dot: 'bg-emerald-400' },
}

function ProgressRing({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 60 ? '#10B981' : score >= 30 ? '#F59E0B' : '#F43F5E'
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black text-white">{score}</p>
        <p className="text-[9px] text-slate-500 -mt-0.5">score</p>
      </div>
    </div>
  )
}

export function Oportunidades() {
  const { company } = useStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!company) { setLoading(false); return }
    Promise.resolve(
      supabase
        .from('improvement_tasks')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
    ).then(({ data, error }) => {
      if (error) console.error('oportunidades:', error.message)
      setTasks((data as Task[]) ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [company])

  const pending = tasks.filter(t => t.status !== 'concluido')
  const done    = tasks.filter(t => t.status === 'concluido')
  const totalHours = pending.reduce((a, t) => a + (IMPACT[t.priority]?.hours ?? 0), 0)
  const totalBRL   = pending.reduce((a, t) => a + (IMPACT[t.priority]?.brl ?? 0), 0)
  const score = tasks.length === 0 ? 0 : Math.min(Math.round(
    (done.length / tasks.length) * 40 +
    (tasks.filter(t => t.priority === 'alta' && t.status === 'concluido').length /
      Math.max(tasks.filter(t => t.priority === 'alta').length, 1)) * 40 +
    Math.min((tasks.length / 10) * 20, 20)
  ), 100)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={26} className="text-indigo-400 animate-spin" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
          <Target size={28} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-white font-semibold mb-1">Complete o onboarding</p>
          <p className="text-slate-400 text-sm">Para ver suas oportunidades de melhoria</p>
        </div>
        <button onClick={() => navigate('/onboarding')} className="px-5 py-2.5 gradient-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25">
          Iniciar diagnóstico
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-6 space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Oportunidades</h1>
        <p className="text-xs text-slate-500 mt-0.5">Identificadas pela investigação C.O.N.T.E.X.T.O.™</p>
      </div>

      {/* Score + métricas */}
      <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-4 flex items-center gap-4">
        <ProgressRing score={score} />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-indigo-400" />
              <span className="text-xs text-slate-400">Tempo recuperável</span>
            </div>
            <span className="text-sm font-bold text-white">{totalHours > 0 ? `${totalHours}h/mês` : '—'}</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-emerald-400" />
              <span className="text-xs text-slate-400">Impacto estimado</span>
            </div>
            <span className="text-sm font-bold text-white">
              {totalBRL > 0 ? `R$ ${totalBRL.toLocaleString('pt-BR')}/mês` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" />
              <span className="text-xs text-slate-400">Em aberto</span>
            </div>
            <span className="text-sm font-bold text-white">{pending.length}</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-6 text-center space-y-3">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <TrendingUp size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Nenhuma oportunidade mapeada</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Converse com a IA para ela investigar seus processos e identificar onde há tempo e dinheiro perdidos.
            </p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20"
          >
            Iniciar investigação <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Cards por prioridade */}
      {(['alta', 'media', 'baixa'] as const).map(prio => {
        const group = pending.filter(t => t.priority === prio)
        if (!group.length) return null
        const meta = PRIORITY[prio]
        return (
          <div key={prio} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className={cn('w-2 h-2 rounded-full', meta.dot)} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                {meta.label} — {group.length}
              </span>
            </div>
            {group.map(task => {
              const isOpen = expanded === task.id
              return (
                <div key={task.id} className={cn('bg-[#0F1422] rounded-2xl border p-4', meta.border)}>
                  <div className="flex items-start gap-3">
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', meta.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">{task.title}</p>
                      <div className="flex gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock size={9} /> ~{IMPACT[task.priority]?.hours ?? 0}h/mês
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <DollarSign size={9} />
                          ~R$ {(IMPACT[task.priority]?.brl ?? 0).toLocaleString('pt-BR')}/mês
                        </span>
                      </div>
                      {isOpen && (
                        <div className="mt-3 space-y-2.5 pt-3 border-t border-white/6">
                          {task.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                          )}
                          {task.impact && (
                            <div className="flex items-start gap-2 bg-indigo-500/6 border border-indigo-500/15 rounded-xl px-3 py-2.5">
                              <Zap size={11} className="text-indigo-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-indigo-300 leading-relaxed">{task.impact}</p>
                            </div>
                          )}
                          {task.methodology && (
                            <p className="text-[10px] text-slate-600">Metodologia: {task.methodology}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setExpanded(isOpen ? null : task.id)}
                      className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors pt-0.5"
                    >
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Concluídas */}
      {done.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-400">Concluídas — {done.length}</span>
          </div>
          {done.map(task => (
            <div key={task.id} className="bg-[#0F1422] rounded-2xl border border-white/4 p-4 opacity-45">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-slate-400 line-through">{task.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      {tasks.length > 0 && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => navigate('/chat')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl text-indigo-300 text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            <Zap size={13} /> Investigar mais
          </button>
          <button
            onClick={() => navigate('/melhorias')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/4 border border-white/8 rounded-2xl text-slate-400 text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            Ver tarefas
          </button>
        </div>
      )}
    </div>
  )
}
