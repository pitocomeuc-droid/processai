import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TrendingUp, Zap, BarChart3, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'

const benefits = [
  'Diagnostico inteligente com IA',
  'Dashboard personalizado por setor',
  'Plano de melhorias em minutos',
  'Funciona em qualquer celular',
  'Suporte para restaurantes, lojas, clinicas e mais',
  'Sem precisar de consultor externo',
]

const sectors = [
  { emoji: '🍽️', name: 'Restaurante' },
  { emoji: '🏪', name: 'Loja Física' },
  { emoji: '🛒', name: 'E-commerce' },
  { emoji: '🏥', name: 'Clínica' },
  { emoji: '🔧', name: 'Oficina' },
  { emoji: '💼', name: 'Escritório' },
]

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-[#0F0F1A] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">ProcessAI</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <section className="px-5 pt-8 pb-10 text-center flex-1">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-6">
          <Zap size={12} className="text-indigo-400" />
          <span className="text-xs text-indigo-300 font-medium">IA para o seu negócio</span>
        </div>

        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
          Reduza desperdícios e{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            melhore seus processos
          </span>{' '}
          com IA
        </h1>

        <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          Diagnostique os problemas da sua empresa, receba um plano de ação e acompanhe as melhorias — tudo pelo celular.
        </p>

        <Button
          size="lg"
          fullWidth
          onClick={() => navigate('/cadastro')}
          className="mb-4 max-w-sm mx-auto"
        >
          Começar gratuitamente
          <ArrowRight size={18} />
        </Button>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => navigate('/login')}
          className="max-w-sm mx-auto"
        >
          Já tenho conta
        </Button>

        {/* Benefits */}
        <div className="mt-10 text-left max-w-sm mx-auto space-y-3">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300 text-sm">{b}</span>
            </div>
          ))}
        </div>

        {/* Sectors */}
        <div className="mt-10 max-w-sm mx-auto">
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Para todos os setores</p>
          <div className="grid grid-cols-3 gap-3">
            {sectors.map((s) => (
              <div
                key={s.name}
                className="bg-[#1E1E2E] border border-white/6 rounded-xl p-3 flex flex-col items-center gap-1"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-xs text-slate-400">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { icon: BarChart3, value: '87%', label: 'redução de retrabalho' },
            { icon: TrendingUp, value: '3x', label: 'mais produtividade' },
            { icon: Shield, value: '100%', label: 'dados seguros' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="text-indigo-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
