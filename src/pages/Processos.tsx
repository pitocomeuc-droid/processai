import { useState, useEffect } from 'react'
import { Plus, ChevronRight, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ProcessItem {
  id: string
  name: string
  description: string | null
  steps: { id: number; name: string; order: number }[]
  problems: string[]
  status: 'ok' | 'atencao' | 'critico'
  methodology: string | null
}

const statusConfig = {
  ok: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'OK' },
  atencao: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Atenção' },
  critico: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Crítico' },
}

export function Processos() {
  const { company } = useStore()
  const [processes, setProcesses] = useState<ProcessItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ProcessItem | null>(null)

  useEffect(() => {
    if (!company) { setLoading(false); return }
    supabase
      .from('processes')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error('Erro ao carregar processos')
        else setProcesses((data as ProcessItem[]) ?? [])
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

  if (!company) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-slate-400 text-sm">Complete o onboarding para mapear seus processos.</p>
      </div>
    )
  }

  if (selected) {
    const cfg = statusConfig[selected.status] ?? statusConfig.atencao
    const StatusIcon = cfg.icon
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-sm">
            ← Voltar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${cfg.bg} rounded-xl p-2`}>
            <StatusIcon size={20} className={cfg.color} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{selected.name}</h2>
            {selected.methodology && (
              <p className="text-sm text-indigo-400">Metodologia: {selected.methodology}</p>
            )}
          </div>
        </div>

        {selected.description && (
          <p className="text-sm text-slate-400">{selected.description}</p>
        )}

        {selected.steps?.length > 0 && (
          <Card>
            <CardTitle>Etapas do Processo</CardTitle>
            <div className="mt-3 space-y-2">
              {selected.steps.map((step, i) => (
                <div key={step.id ?? i} className="flex items-center gap-3 bg-[#2A2A3E] rounded-xl p-3">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold shrink-0">
                    {step.order ?? i + 1}
                  </div>
                  <p className="text-sm text-slate-300">{step.name}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {selected.problems?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Problemas Identificados</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {selected.problems.map((problem, i) => (
                <div key={i} className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{problem}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Meus Processos</h1>
        <button className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
          <Plus size={14} /> Novo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: processes.length, color: 'text-white' },
          { label: 'Críticos', value: processes.filter((p) => p.status === 'critico').length, color: 'text-red-400' },
          { label: 'Saudáveis', value: processes.filter((p) => p.status === 'ok').length, color: 'text-emerald-400' },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {processes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm">
            Nenhum processo mapeado ainda. Converse com a IA para começar o mapeamento!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {processes.map((p) => {
            const cfg = statusConfig[p.status] ?? statusConfig.atencao
            const Icon = cfg.icon
            const problemCount = p.problems?.length ?? 0
            return (
              <Card key={p.id} onClick={() => setSelected(p)}>
                <div className="flex items-center gap-3">
                  <div className={`${cfg.bg} rounded-xl p-2.5`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.steps?.length ?? 0} etapas
                      {p.methodology ? ` · ${p.methodology}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {problemCount > 0 && (
                      <span className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded-full">
                        {problemCount} problema{problemCount > 1 ? 's' : ''}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
