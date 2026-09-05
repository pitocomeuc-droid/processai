import { useStore } from '@/store/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, MessageSquare, Bell } from 'lucide-react'

const weeklyData = [
  { day: 'Seg', problemas: 8, resolvidos: 3 },
  { day: 'Ter', problemas: 6, resolvidos: 5 },
  { day: 'Qua', problemas: 9, resolvidos: 4 },
  { day: 'Qui', problemas: 4, resolvidos: 7 },
  { day: 'Sex', problemas: 5, resolvidos: 6 },
  { day: 'Sáb', problemas: 3, resolvidos: 3 },
  { day: 'Dom', problemas: 2, resolvidos: 2 },
]

const taskStatusData = [
  { name: 'Concluídas', value: 8, color: '#10B981' },
  { name: 'Em andamento', value: 5, color: '#6C63FF' },
  { name: 'Pendentes', value: 3, color: '#F59E0B' },
  { name: 'Críticas', value: 2, color: '#EF4444' },
]

const radarData = [
  { dimension: 'Qualidade', score: 72 },
  { dimension: 'Velocidade', score: 58 },
  { dimension: 'Custo', score: 65 },
  { dimension: 'Equipe', score: 80 },
  { dimension: 'Cliente', score: 70 },
  { dimension: 'Processo', score: 55 },
]

const alerts = [
  { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', text: 'Gargalo identificado no atendimento ao cliente', time: '2h atrás' },
  { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10', text: 'Retrabalho aumentou 15% nesta semana', time: '5h atrás' },
  { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', text: 'Meta de redução de custos atingida!', time: '1d atrás' },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string; color: string}[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1E1E2E] border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export function Dashboard() {
  const { user, company } = useStore()
  const navigate = useNavigate()
  const score = company?.health_score ?? 65
  const sectorEmojis: Record<string, string> = {
    restaurante: '🍽️', bar: '🍺', loja_fisica: '🏪',
    loja_online: '🛒', clinica: '🏥', oficina: '🔧', escritorio: '💼', outro: '🏢',
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Olá, {user?.name?.split(' ')[0]} 👋</p>
          <h1 className="text-xl font-bold text-white">
            {sectorEmojis[company?.sector ?? '']} {company?.name ?? 'Minha Empresa'}
          </h1>
        </div>
        <button className="relative w-10 h-10 rounded-xl bg-[#1E1E2E] border border-white/6 flex items-center justify-center">
          <Bell size={18} className="text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
      </div>

      {/* Health Score + Stats */}
      <Card glow className="flex items-center gap-4">
        <HealthGauge score={score} />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Score de Saúde</p>
            <p className="text-sm text-slate-300">Baseado nas últimas 7 análises</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#2A2A3E] rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-emerald-400">8</p>
              <p className="text-[10px] text-slate-500">Resolvidos</p>
            </div>
            <div className="bg-[#2A2A3E] rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-yellow-400">5</p>
              <p className="text-[10px] text-slate-500">Pendentes</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas da semana</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`${a.bg} rounded-lg p-1.5 shrink-0 mt-0.5`}>
                <a.icon size={14} className={a.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 leading-snug">{a.text}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Problemas vs. Resolvidos</CardTitle>
        </CardHeader>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={10} barGap={4}>
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="problemas" fill="#EF4444" radius={[4, 4, 0, 0]} name="Problemas" />
              <Bar dataKey="resolvidos" fill="#10B981" radius={[4, 4, 0, 0]} name="Resolvidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Task Status Pie */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Melhorias</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} dataKey="value" paddingAngle={3}>
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {taskStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Radar Maturidade */}
      <Card>
        <CardHeader>
          <CardTitle>Maturidade Operacional</CardTitle>
        </CardHeader>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2A2A3E" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Radar dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Trend Line */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução do Score</CardTitle>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">+12pts</span>
            </div>
          </div>
        </CardHeader>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { week: 'S1', score: 45 }, { week: 'S2', score: 52 }, { week: 'S3', score: 49 },
              { week: 'S4', score: 58 }, { week: 'S5', score: 63 }, { week: 'S6', score: 65 },
            ]}>
              <XAxis dataKey="week" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[30, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 3 }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* CTA Chat */}
      <div
        onClick={() => navigate('/chat')}
        className="gradient-primary rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-98 transition-transform"
      >
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <MessageSquare size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Falar com a IA</p>
          <p className="text-indigo-200 text-xs">Tire dúvidas e receba sugestões agora</p>
        </div>
        <Button variant="ghost" size="sm" className="text-white shrink-0">Abrir</Button>
      </div>
    </div>
  )
}
