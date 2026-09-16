import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Zap, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'alta' | 'media' | 'baixa'
  status: 'pendente' | 'em_andamento' | 'concluido'
  due_date: string | null
  methodology: string | null
  impact: string | null
}

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
  const { company } = useStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!company) { setLoading(false); return }
    supabase
      .from('improvement_tasks')
      .select('*')
      .eq('company_id', company.id)
      .order('priority', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error('Erro ao carregar melhorias')
        else setTasks((data as Task[]) ?? [])
        setLoading(false)
      })
  }, [company])

  const toggleStatus = async (task: Task) => {
    const next: Task['status'] =
      task.status === 'concluido' ? 'pendente' :
      task.status === 'pendente' ? 'em_andamento' : 'concluido'

    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t))

    const { error } = await supabase
      .from('improvement_tasks')
      .update({ status: next })
      .eq('id', task.id)

    if (error) {
      toast.error('Erro ao atualizar status')
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t))
    }
  }

  const filtered = tasks.filter((t) => filter === 'todos' || t.status === filter)
  const completedCount = tasks.filter((t) => t.status === 'concluido').length

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
        <p className="text-slate-400 text-sm">Complete o onboarding para ver seu plano de melhorias.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Plano de Melhorias</h1>
        <div className="flex items-center gap-1 text-emerald-400">
          <Zap size={14} />
          <span className="text-xs font-medium">{completedCount}/{tasks.length}</span>
        </div>
      </div>

      {tasks.length > 0 && (
        <>
          <div className="bg-[#0F1422] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: tasks.length ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-slate-500">{completedCount} de {tasks.length} melhorias concluídas</p>
        </>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['todos', 'pendente', 'em_andamento', 'concluido'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
              filter === f
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-[#0F1422] text-slate-400 border border-white/6'
            )}
          >
            {f === 'todos' ? 'Todos' : f === 'em_andamento' ? 'Em andamento' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm">
            {tasks.length === 0
              ? 'Nenhuma melhoria cadastrada ainda. Converse com a IA para gerar seu plano!'
              : 'Nenhuma tarefa neste filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const pCfg = priorityConfig[task.priority] ?? priorityConfig.media
            const sCfg = statusConfig[task.status] ?? statusConfig.pendente
            const StatusIcon = sCfg.icon
            const isExpanded = expanded === task.id

            return (
              <Card key={task.id} className={cn(task.status === 'concluido' && 'opacity-60')}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStatus(task)}
                    className={cn('mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      task.status === 'concluido' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                    )}
                  >
                    {task.status === 'concluido' && <CheckCircle2 size={12} className="text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium mb-1', task.status === 'concluido' ? 'line-through text-slate-500' : 'text-white')}>
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', pCfg.bg, pCfg.color)}>
                        {pCfg.label}
                      </span>
                      {task.methodology && (
                        <span className="text-[10px] text-indigo-400">{task.methodology}</span>
                      )}
                      <span className={cn('text-[10px] flex items-center gap-1', sCfg.color)}>
                        <StatusIcon size={10} /> {sCfg.label}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {task.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                        )}
                        {task.impact && (
                          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                            <Zap size={12} className="text-emerald-400" />
                            <p className="text-xs text-emerald-400">{task.impact}</p>
                          </div>
                        )}
                        {task.due_date && (
                          <p className="text-[10px] text-slate-500">
                            Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
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
      )}
    </div>
  )
}
