import { useState } from 'react'
import { Plus, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProcessItem {
  id: string
  name: string
  steps: number
  problems: number
  status: 'ok' | 'atencao' | 'critico'
  methodology: string
}

const mockProcesses: ProcessItem[] = [
  { id: '1', name: 'Atendimento ao Cliente', steps: 5, problems: 2, status: 'atencao', methodology: 'Lean' },
  { id: '2', name: 'Abertura e Fechamento', steps: 8, problems: 0, status: 'ok', methodology: '5S + PDCA' },
  { id: '3', name: 'Gestão de Estoque', steps: 6, problems: 3, status: 'critico', methodology: 'Six Sigma' },
  { id: '4', name: 'Fluxo de Pedidos', steps: 7, problems: 1, status: 'atencao', methodology: 'BPM' },
]

const statusConfig = {
  ok: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'OK' },
  atencao: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Atenção' },
  critico: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Crítico' },
}

export function Processos() {
  const [selected, setSelected] = useState<ProcessItem | null>(null)

  if (selected) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">← Voltar</button>
        </div>

        <h2 className="text-xl font-bold text-white">{selected.name}</h2>
        <p className="text-sm text-indigo-400">Metodologia: {selected.methodology}</p>

        <Card>
          <CardTitle>Etapas do Processo</CardTitle>
          <div className="mt-3 space-y-2">
            {Array.from({ length: selected.steps }, (_, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#2A2A3E] rounded-xl p-3">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-300">Etapa {i + 1} do processo</p>
              </div>
            ))}
          </div>
        </Card>

        {selected.problems > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Problemas Identificados</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {Array.from({ length: selected.problems }, (_, i) => (
                <div key={i} className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">Problema identificado pela IA — acesse o chat para ver a sugestão de melhoria</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Meus Processos</h1>
        <Button size="sm" variant="secondary">
          <Plus size={16} /> Novo
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: mockProcesses.length, color: 'text-white' },
          { label: 'Críticos', value: mockProcesses.filter((p) => p.status === 'critico').length, color: 'text-red-400' },
          { label: 'Saudáveis', value: mockProcesses.filter((p) => p.status === 'ok').length, color: 'text-emerald-400' },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {mockProcesses.map((p) => {
          const cfg = statusConfig[p.status]
          const Icon = cfg.icon
          return (
            <Card key={p.id} onClick={() => setSelected(p)}>
              <div className="flex items-center gap-3">
                <div className={`${cfg.bg} rounded-xl p-2.5`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.steps} etapas · {p.methodology}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.problems > 0 && (
                    <span className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded-full">
                      {p.problems} problema{p.problems > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
