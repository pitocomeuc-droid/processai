import { useState, useEffect } from 'react'
import { ExternalLink, Loader2, Sparkles, Smartphone, FileText, BarChart2, Globe, Zap, Wrench, Lock } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Solution {
  id: string
  title: string
  description: string | null
  type: string
  access_url: string | null
  is_active: boolean
  created_at: string
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  app:        { icon: Smartphone,  label: 'Aplicativo',  color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
  form:       { icon: FileText,    label: 'Formulário',  color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  report:     { icon: BarChart2,   label: 'Relatório',   color: 'text-purple-400',  bg: 'bg-purple-500/15' },
  site:       { icon: Globe,       label: 'Site',        color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
  automation: { icon: Zap,         label: 'Automação',   color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  other:      { icon: Wrench,      label: 'Ferramenta',  color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
}

function SolutionCard({ solution }: { solution: Solution }) {
  const cfg = typeConfig[solution.type] ?? typeConfig.other
  const Icon = cfg.icon
  const date = new Date(solution.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  const handleAccess = () => {
    if (!solution.access_url) return
    window.open(solution.access_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-[#0F1422] rounded-2xl border border-white/6 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', cfg.bg)}>
            <Icon size={22} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
              <span className="text-[10px] text-slate-500">{date}</span>
            </div>
            <p className="text-white font-semibold text-sm leading-snug">{solution.title}</p>
            {solution.description && (
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{solution.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {solution.access_url ? (
          <button
            onClick={handleAccess}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold transition-all active:scale-98"
          >
            <ExternalLink size={15} /> Acessar Solução
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2A2A3E] text-slate-500 text-sm">
            <Lock size={14} /> Link em breve
          </div>
        )}
      </div>
    </div>
  )
}

export function Solucoes() {
  const { company } = useStore()
  const navigate = useNavigate()
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company?.id) { setLoading(false); return }

    supabase
      .from('solutions')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error('Erro ao carregar soluções')
        else setSolutions((data as Solution[]) ?? [])
        setLoading(false)
      })
  }, [company])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 size={28} className="text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Minhas Soluções</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          {solutions.length > 0
            ? `${solutions.length} solução${solutions.length > 1 ? 'ões' : ''} entregue${solutions.length > 1 ? 's' : ''} pelo time ProcessAI`
            : 'Soluções criadas pelo time ProcessAI para você'}
        </p>
      </div>

      {solutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
            <Sparkles size={32} className="text-indigo-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Nenhuma solução ainda</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Converse com a IA sobre os problemas do seu negócio. Nosso time vai criar soluções personalizadas e liberar o acesso aqui.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="gradient-primary text-white font-semibold text-sm px-6 py-3 rounded-xl active:scale-98 transition-all"
          >
            Conversar com a IA agora
          </button>
        </div>
      ) : (
        <>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-indigo-200 text-xs leading-relaxed">
              Estas soluções foram criadas especialmente para <strong>{company?.name}</strong> com base no diagnóstico do seu negócio.
            </p>
          </div>

          <div className="space-y-3">
            {solutions.map(s => (
              <SolutionCard key={s.id} solution={s} />
            ))}
          </div>

          <div
            onClick={() => navigate('/chat')}
            className="flex items-center gap-3 bg-[#0F1422] border border-white/6 rounded-2xl p-4 cursor-pointer active:scale-98 transition-all"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Precisa de mais?</p>
              <p className="text-slate-500 text-xs">Converse com a IA para gerar novas ideias</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
