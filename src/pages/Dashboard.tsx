import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts'
import {
  Bell, Brain, MessageSquare, Sparkles, TrendingUp, Clock,
  ChevronRight, Eye, ChevronDown, ChevronUp, Zap, X,
} from 'lucide-react'

const sectorEmojis: Record<string, string> = {
  restaurante: '🍽️', bar: '🍺', loja_fisica: '🏪',
  loja_online: '🛒', clinica: '🏥', oficina: '🔧', escritorio: '💼', outro: '🏢',
}

const radarDimensions = ['Processos', 'Controle', 'Tecnologia', 'Vendas', 'Financeiro', 'Pessoas', 'Automação', 'Gestão']

function NotificationPanel({ onClose, companyId }: { onClose: () => void; companyId: string }) {
  const [items, setItems] = useState<{ label: string; sub: string; color: string }[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('improvement_tasks').select('title, priority, created_at').eq('company_id', companyId).eq('status', 'pendente').order('created_at', { ascending: false }).limit(3),
      supabase.from('solutions').select('title, created_at').eq('company_id', companyId).eq('is_active', true).order('created_at', { ascending: false }).limit(2),
    ]).then(([tasks, solutions]) => {
      const list: typeof items = []
      solutions.data?.forEach(s => list.push({ label: `Solução disponível: ${s.title}`, sub: 'Acesse em Soluções', color: 'text-emerald-400' }))
      tasks.data?.forEach(t => list.push({ label: t.title, sub: `Prioridade ${t.priority}`, color: t.priority === 'alta' ? 'text-rose-400' : t.priority === 'media' ? 'text-amber-400' : 'text-slate-400' }))
      setItems(list.length ? list : [{ label: 'Tudo em dia!', sub: 'Nenhuma pendência no momento.', color: 'text-slate-400' }])
    })
  }, [companyId])

  return (
    <div className="absolute top-14 right-4 w-72 bg-[#0F1422] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-fadeInUp">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <p className="text-sm font-semibold text-white">Notificações</p>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="divide-y divide-white/4 max-h-72 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-current" style={{ color: item.color.replace('text-', '') }} />
            <div>
              <p className="text-xs text-slate-200 leading-snug">{item.label}</p>
              <p className={`text-[10px] mt-0.5 ${item.color}`}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Tooltip_ = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1422] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export function Dashboard() {
  const { user, company, onboardingAnswers } = useStore()
  const navigate = useNavigate()

  const [solutionCount, setSolutionCount] = useState(0)
  const [taskCount, setTaskCount]         = useState(0)
  const [contextCount, setContextCount]   = useState(0)
  const [pendingTasks, setPendingTasks]   = useState(0)
  const [doneTaskCount, setDoneTaskCount] = useState(0)
  const [contextEntries, setContextEntries] = useState<{ type: string; content: string }[]>([])
  const [showContext, setShowContext]     = useState(false)
  const [showBell, setShowBell]           = useState(false)
  const [weeklyData, setWeeklyData] = useState(
    ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(day => ({ day, gargalos: 0, resolvidos: 0 }))
  )
  const bellRef = useRef<HTMLButtonElement>(null)

  const score = company?.health_score ?? 50
  const expectedAnswers = 15
  const contextoPercent = Math.min(
    Math.round(((onboardingAnswers.length + Math.min(contextCount, 10)) / (expectedAnswers + 10)) * 100),
    95
  )

  const scoreColor   = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#F43F5E'
  const scoreBg      = score >= 70 ? 'border-emerald-500/20 bg-emerald-500/5' : score >= 45 ? 'border-amber-500/20 bg-amber-500/5' : 'border-rose-500/20 bg-rose-500/5'
  const scoreLabel   = score >= 70 ? 'Saudável' : score >= 45 ? 'Em desenvolvimento' : 'Atenção necessária'

  const radarData = radarDimensions.map(dim => ({
    dimension: dim,
    score: Math.max(10, Math.min(score + (Math.random() * 30 - 15), 100)),
  }))

  useEffect(() => {
    if (!company?.id) return
    Promise.all([
      supabase.from('solutions').select('id', { count: 'exact' }).eq('company_id', company.id).eq('is_active', true),
      supabase.from('improvement_tasks').select('id, status, created_at', { count: 'exact' }).eq('company_id', company.id),
      supabase.from('client_context').select('id, type, content', { count: 'exact' }).eq('company_id', company.id).order('created_at', { ascending: false }).limit(20),
    ]).then(([solutions, tasks, context]) => {
      setSolutionCount(solutions.count ?? 0)
      setContextCount(context.count ?? 0)
      setContextEntries((context.data as { type: string; content: string }[]) ?? [])

      const all = tasks.data ?? []
      setTaskCount(tasks.count ?? 0)
      setDoneTaskCount(all.filter(t => t.status === 'concluido').length)
      setPendingTasks(all.filter(t => t.status !== 'concluido').length)

      const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
      const map: Record<string, { gargalos: number; resolvidos: number }> = {}
      ;['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach(d => { map[d] = { gargalos: 0, resolvidos: 0 } })
      const now = new Date()
      all.forEach(t => {
        const diff = Math.floor((now.getTime() - new Date(t.created_at).getTime()) / 86400000)
        if (diff <= 6) {
          const d = days[new Date(t.created_at).getDay()]
          map[d].gargalos += 1
          if (t.status === 'concluido') map[d].resolvidos += 1
        }
      })
      setWeeklyData(['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(day => ({ day, ...map[day] })))
    })
  }, [company])

  const notifCount = pendingTasks + solutionCount

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-5 space-y-4 relative">

      {/* Bell panel */}
      {showBell && company?.id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowBell(false)} />
          <NotificationPanel companyId={company.id} onClose={() => setShowBell(false)} />
        </>
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-xs">Olá, {user?.name?.split(' ')[0]}</p>
            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">v10.1</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-0.5">
            {sectorEmojis[company?.sector ?? '']} {company?.name ?? 'Minha Empresa'}
          </h1>
        </div>
        <button
          ref={bellRef}
          onClick={() => setShowBell(v => !v)}
          className="relative w-10 h-10 rounded-xl bg-[#0F1422] border border-white/8 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Bell size={17} className={notifCount > 0 ? 'text-white' : 'text-slate-500'} />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 gradient-primary rounded-full flex items-center justify-center text-[9px] font-bold text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Score card ──────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 ${scoreBg}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={14} style={{ color: scoreColor }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: scoreColor }}>
              {scoreLabel}
            </p>
          </div>
          <p className="text-2xl font-black text-white">{score}<span className="text-sm text-slate-500 font-normal">/100</span></p>
        </div>

        {/* Contexto progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-400">Contexto empresarial conhecido</p>
            <p className="text-xs font-bold text-white">{contextoPercent}%</p>
          </div>
          <div className="h-2 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${contextoPercent}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Gargalos', value: pendingTasks, color: '#F43F5E' },
            { label: 'Processos', value: taskCount,   color: '#818CF8' },
            { label: 'Soluções',  value: solutionCount, color: '#10B981' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-black/20 rounded-xl p-2.5 text-center">
              <p className="text-base font-bold" style={{ color }}>{value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA baixo contexto ──────────────────────────────────── */}
      {contextoPercent < 40 && (
        <button
          onClick={() => navigate('/chat')}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-violet-500/25 bg-violet-500/6 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-9 h-9 bg-violet-500/15 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={16} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Diagnóstico incompleto</p>
            <p className="text-xs text-violet-300 truncate">Conte mais sobre sua operação</p>
          </div>
          <ChevronRight size={14} className="text-violet-400 shrink-0" />
        </button>
      )}

      {/* ── Solução disponível ──────────────────────────────────── */}
      {solutionCount > 0 && (
        <button
          onClick={() => navigate('/solucoes')}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {solutionCount} solução{solutionCount > 1 ? 'ões' : ''} disponível{solutionCount > 1 ? 'eis' : ''}
            </p>
            <p className="text-xs text-emerald-300">Entregue pelo time ProcessAI</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* ── Atividade semanal ───────────────────────────────────── */}
      <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Atividade da semana</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /><span className="text-[10px] text-slate-500">Gargalos</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] text-slate-500">Resolvidos</span></div>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={8} barGap={3} barCategoryGap="35%">
              <XAxis dataKey="day" tick={{ fill: '#4A5270', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<Tooltip_ />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="gargalos"  fill="#F43F5E" radius={[4, 4, 0, 0]} name="Gargalos" />
              <Bar dataKey="resolvidos" fill="#10B981" radius={[4, 4, 0, 0]} name="Resolvidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {taskCount === 0 && (
          <p className="text-center text-[11px] text-slate-600 mt-1">Converse com a IA para gerar dados aqui</p>
        )}
      </div>

      {/* ── Maturidade Radar ────────────────────────────────────── */}
      <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-white">Maturidade Operacional</p>
          <span className="text-[10px] text-slate-500 bg-white/4 px-2 py-0.5 rounded-full">Estimado</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">Atualiza conforme o diagnóstico avança</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#4A5270', fontSize: 9 }} />
              <Radar dataKey="score" stroke="#5B6EFF" fill="#5B6EFF" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Evolução do Score ───────────────────────────────────── */}
      <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Evolução do Score</p>
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp size={13} />
            <span className="text-xs">em progresso</span>
          </div>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { week: 'S1', score: 50 },
              { week: 'S2', score: score > 50 ? 53 : 50 },
              { week: 'S3', score: score > 53 ? 57 : 50 },
              { week: 'Atual', score },
            ]}>
              <XAxis dataKey="week" tick={{ fill: '#4A5270', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[30, 100]} />
              <Tooltip content={<Tooltip_ />} />
              <Line type="monotone" dataKey="score" stroke="#5B6EFF" strokeWidth={2} dot={{ fill: '#5B6EFF', r: 3, strokeWidth: 0 }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── O que a IA sabe ─────────────────────────────────────── */}
      {contextEntries.length > 0 && (
        <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-4">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowContext(v => !v)}
          >
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white">O que a IA sabe sobre você</span>
              <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">
                {contextEntries.length}
              </span>
            </div>
            {showContext
              ? <ChevronUp size={14} className="text-slate-500" />
              : <ChevronDown size={14} className="text-slate-500" />
            }
          </button>
          {showContext && (
            <div className="mt-3 space-y-2.5">
              {contextEntries.slice(0, 6).map((e, i) => {
                const colors: Record<string, string> = {
                  problema: 'text-rose-400 bg-rose-400/10',
                  objetivo: 'text-violet-400 bg-violet-400/10',
                  feedback: 'text-teal-400 bg-teal-400/10',
                  hipotese: 'text-amber-400 bg-amber-400/10',
                  fato:     'text-blue-400 bg-blue-400/10',
                  oportunidade: 'text-emerald-400 bg-emerald-400/10',
                }
                const cls = colors[e.type] ?? 'text-slate-400 bg-slate-400/10'
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md mt-0.5 ${cls}`}>
                      {e.type}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{e.content}</p>
                  </div>
                )
              })}
              {contextEntries.length > 6 && (
                <p className="text-[10px] text-slate-500 text-center">+{contextEntries.length - 6} outros registros</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CTA Chat ────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/chat')}
        className="w-full gradient-primary rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-lg shadow-indigo-500/20"
      >
        <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <MessageSquare size={20} className="text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-semibold text-sm">Conversar com a IA</p>
          <p className="text-indigo-200 text-xs">Investigação C.O.N.T.E.X.T.O.™</p>
        </div>
        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2.5 py-1.5">
          <Clock size={11} className="text-white/70" />
          <span className="text-xs text-white/70 font-medium">Agora</span>
        </div>
      </button>

    </div>
  )
}
