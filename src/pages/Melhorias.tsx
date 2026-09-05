import { useState } from 'react'
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

interface Task {
  id: string
  title: string
  description: string
  priority: 'alta' | 'media' | 'baixa'
  status: 'pendente' | 'em_andamento' | 'concluido'
  due_date: string
  methodology: string
  impact: string
}

const tasks: Task[] = [
  {
    id: '1', title: 'Implementar checklist de abertura', priority: 'alta', status: 'em_andamento',
    due_date: '2026-09-10', methodology: '5S', impact: 'Reduz erros em 40%',
    description: 'Criar um checklist digital com todas as tarefas de abertura para garantir padronização e rastreabilidade.',
  },
  {
    id: '2', title: 'Mapear fluxo de atendimento', priority: 'alta', status: 'pendente',
    due_date: '2026-09-15', methodology: 'BPM', impact: 'Identifica gargalos',
    description: 'Documentar cada etapa do atendimento ao cliente, desde a entrada até a saída, identificando pontos de espera.',
  },
  {
    id: '3', title: 'Treinar equipe no padrão de pedidos', priority: 'media', status: 'pendente',
    due_date: '2026-09-20', methodology: 'Lean', impact: 'Reduz retrabalho',
    description: 'Realizar treinamento de 2h com toda a equipe sobre o novo fluxo padronizado de pedidos.',
  },
  {
    id: '4', title: 'Revisar controle de estoque', priority: 'media', status: 'em_andamento',
    due_date: '2026-09-18', methodology: 'Six Sigma', impact: 'Elimina desperdício',
    description: 'Auditar o processo atual de controle de estoque e implementar contagem diária com registro digital.',
  },
  {
    id: '5', title: 'Padronizar comunicação interna', priority: 'baixa', status: 'concluido',
    due_date: '2026-09-01', methodology: 'PDCA', impact: 'Melhora alinhamento',
    description: 'Definir canal único de comunicação (WhatsApp Business) e horários de reunião semanal.',
  },
]

const priorityConfig = {
  alta: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Alta' },
  media: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Média' },
  baixa: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Baixa' },
}

const statusConfig = {
  pendente: { icon: Clock, color: 'text-slate-400', label: 'Pendente' },
  em_andamento: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Em andamento' },
  concluido: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Concluído' },
}

type Filter = 'todos' | 'pendente' | 'em_andamento' | 'concluido'

export function Melhorias() {
  const [filter, setFilter] = useState<Filter>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<Record<string, Task['status']>>({})

  const filtered = tasks.filter((t) => filter === 'todos' || t.status === filter)
  const completedCount = tasks.filter((t) => (taskStatus[t.id] || t.status) === 'concluido').length

  const toggleStatus = (task: Task) => {
    const cur = taskStatus[task.id] || task.status
    const next: Task['status'] = cur === 'concluido' ? 'pendente' : cur === 'pendente' ? 'em_andamento' : 'concluido'
    setTaskStatus({ ...taskStatus, [task.id]: next })
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Plano de Melhorias</h1>
        <div className="flex items-center gap-1 text-emerald-400">
          <Zap size={14} />
          <span className="text-xs font-medium">{completedCount}/{tasks.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-[#1E1E2E] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / tasks.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{completedCount} de {tasks.length} melhorias concluídas</p>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['todos', 'pendente', 'em_andamento', 'concluido'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
              filter === f
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-[#1E1E2E] text-slate-400 border border-white/6'
            )}
          >
            {f === 'todos' ? 'Todos' : f === 'em_andamento' ? 'Em andamento' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {filtered.map((task) => {
          const status = taskStatus[task.id] || task.status
          const pCfg = priorityConfig[task.priority]
          const sCfg = statusConfig[status]
          const StatusIcon = sCfg.icon
          const isExpanded = expanded === task.id

          return (
            <Card key={task.id} className={cn(status === 'concluido' && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStatus(task)}
                  className={cn('mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    status === 'concluido' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                  )}
                >
                  {status === 'concluido' && <CheckCircle2 size={12} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className={cn('text-sm font-medium', status === 'concluido' ? 'line-through text-slate-500' : 'text-white')}>
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', pCfg.bg, pCfg.color)}>
                      {pCfg.label}
                    </span>
                    <span className="text-[10px] text-indigo-400">{task.methodology}</span>
                    <span className={cn('text-[10px] flex items-center gap-1', sCfg.color)}>
                      <StatusIcon size={10} /> {sCfg.label}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <Zap size={12} className="text-emerald-400" />
                        <p className="text-xs text-emerald-400">{task.impact}</p>
                      </div>
                      <p className="text-[10px] text-slate-500">Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : task.id)}
                  className="shrink-0 text-slate-500"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
