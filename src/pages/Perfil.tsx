import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LogOut, ChevronRight, Building2, Shield, Bell, BarChart3, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'pitocomeuc@gmail.com'

const sectorLabels: Record<string, string> = {
  restaurante: '🍽️ Restaurante', bar: '🍺 Bar', loja_fisica: '🏪 Loja Física',
  loja_online: '🛒 E-commerce', clinica: '🏥 Clínica', oficina: '🔧 Oficina',
  escritorio: '💼 Escritório', outro: '🏢 Outro',
}

function getInitials(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Perfil() {
  const { user, company, reset } = useStore()
  const navigate = useNavigate()
  const [taskCount, setTaskCount]         = useState(0)
  const [solutionCount, setSolutionCount] = useState(0)
  const [memoryCount, setMemoryCount]     = useState(0)

  useEffect(() => {
    if (!company?.id) return
    Promise.all([
      supabase.from('improvement_tasks').select('id', { count: 'exact' }).eq('company_id', company.id),
      supabase.from('solutions').select('id', { count: 'exact' }).eq('company_id', company.id).eq('is_active', true),
      supabase.from('ai_memories').select('id', { count: 'exact' }).eq('company_id', company.id),
    ]).then(([tasks, solutions, memories]) => {
      setTaskCount(tasks.count ?? 0)
      setSolutionCount(solutions.count ?? 0)
      setMemoryCount(memories.count ?? 0)
    })
  }, [company])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    toast.success('Sessão encerrada')
    navigate('/')
  }

  const score = company?.health_score ?? 0
  const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 45 ? 'text-amber-400' : 'text-rose-400'
  const scoreBg    = score >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 45 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'
  const initials   = getInitials(user?.name)
  const isAdmin    = user?.email === ADMIN_EMAIL

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain pb-6">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative px-4 pt-8 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-indigo-600/10 blur-[60px]" />
        </div>
        <div className="relative flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
            {isAdmin && (
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 gradient-amber rounded-lg flex items-center justify-center shadow-md">
                <Star size={11} className="text-white fill-white" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">{user?.name ?? 'Usuário'}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                <Zap size={9} fill="currentColor" /> Admin ProcessAI
              </span>
            )}
          </div>

          {/* Score pill */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${scoreBg}`}>
            <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
            <div className="text-left">
              <p className="text-[10px] text-slate-500">Score ProcessAI</p>
              <p className={`text-xs font-semibold ${scoreColor}`}>
                {score >= 70 ? 'Saudável' : score >= 45 ? 'Em desenvolvimento' : 'Atenção'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empresa ───────────────────────────────────────────── */}
      {company && (
        <div className="px-4 mb-4">
          <div className="bg-[#0F1422] rounded-2xl border border-white/6 p-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Empresa</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-2xl">{(sectorLabels[company.sector] ?? '🏢').split(' ')[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{company.name}</p>
                <p className="text-xs text-slate-400">{sectorLabels[company.sector] ?? 'Outro'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Processos', value: taskCount, color: 'text-indigo-400' },
                { label: 'Insights IA', value: memoryCount, color: 'text-violet-400' },
                { label: 'Soluções', value: solutionCount, color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/4 rounded-xl p-2.5 text-center">
                  <p className={`text-lg font-black ${color}`}>{value}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Menu ──────────────────────────────────────────────── */}
      <div className="px-4 space-y-3">

        {isAdmin && (
          <div className="bg-[#0F1422] rounded-2xl border border-amber-500/20 overflow-hidden">
            <p className="px-4 pt-3 pb-1 text-[10px] text-amber-400 font-bold uppercase tracking-widest">Admin</p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/3 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center shrink-0">
                <Star size={14} className="text-amber-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">Painel Admin</p>
                <p className="text-xs text-slate-500">Gerenciar clientes e soluções</p>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          </div>
        )}

        <div className="bg-[#0F1422] rounded-2xl border border-white/6 overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Conta</p>
          {[
            { icon: Building2, label: 'Dados da empresa', sub: 'Editar informações', color: 'bg-violet-500/15 text-violet-400' },
            { icon: Shield,    label: 'Segurança',         sub: 'Senha e privacidade', color: 'bg-blue-500/15 text-blue-400' },
          ].map(({ icon: Icon, label, sub, color }, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-white/4 first:border-t-0 active:bg-white/3 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          ))}
        </div>

        <div className="bg-[#0F1422] rounded-2xl border border-white/6 overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Preferências</p>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/3 transition-colors">
            <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center shrink-0">
              <Bell size={14} className="text-amber-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Notificações</p>
              <p className="text-xs text-slate-500">Alertas e lembretes</p>
            </div>
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        </div>

        <div className="bg-[#0F1422] rounded-2xl border border-white/6 overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Análises</p>
          <button
            onClick={() => navigate('/melhorias')}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/3 transition-colors"
          >
            <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center shrink-0">
              <BarChart3 size={14} className="text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Histórico de melhorias</p>
              <p className="text-xs text-slate-500">Ver progresso completo</p>
            </div>
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border border-rose-500/20 bg-rose-500/4 active:scale-[0.98] transition-transform"
        >
          <div className="w-8 h-8 bg-rose-500/15 rounded-lg flex items-center justify-center shrink-0">
            <LogOut size={14} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-rose-400">Sair da conta</p>
        </button>

        <p className="text-center text-[10px] text-slate-600 pb-2">ProcessAI v1.0 · Feito com inteligência</p>
      </div>
    </div>
  )
}
