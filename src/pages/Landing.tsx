import { useNavigate } from 'react-router-dom'
import { ArrowRight, Brain, Search, Lightbulb, Wrench, BarChart3, RotateCcw, ChevronRight } from 'lucide-react'

const sectors = [
  { emoji: '🍽️', name: 'Restaurante' }, { emoji: '🏪', name: 'Loja Física' },
  { emoji: '🛒', name: 'E-commerce' }, { emoji: '🏥', name: 'Clínica' },
  { emoji: '🔧', name: 'Oficina' }, { emoji: '💼', name: 'Escritório' },
  { emoji: '🍺', name: 'Bar' }, { emoji: '🚚', name: 'Logística' },
]

const cycle = [
  { icon: Brain,     label: 'Cliente conta',  color: '#818CF8' },
  { icon: Search,    label: 'IA investiga',    color: '#C084FC' },
  { icon: Lightbulb, label: 'IA encontra',     color: '#F59E0B' },
  { icon: Wrench,    label: 'Time cria',       color: '#10B981' },
  { icon: BarChart3, label: 'Cliente aplica',  color: '#3B82F6' },
  { icon: RotateCcw, label: 'ProcessAI mede',  color: '#818CF8' },
]

const contexto = [
  { letter: 'C', label: 'Como funciona hoje' },
  { letter: 'O', label: 'Onde está o problema' },
  { letter: 'N', label: 'Necessidade real' },
  { letter: 'T', label: 'Tempo utilizado' },
  { letter: 'E', label: 'Erros e desperdícios' },
  { letter: 'X', label: 'Experiência desejada' },
  { letter: 'T', label: 'Tecnologia atual' },
  { letter: 'O', label: 'Objetivo final' },
]

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-[#080C14] flex flex-col overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Brain size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-[17px] tracking-tight">ProcessAI</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-slate-400 px-4 py-1.5 rounded-lg border border-white/8 bg-white/3"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <section className="relative px-5 pt-10 pb-14 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
          <div className="absolute top-16 right-0 w-64 h-64 rounded-full bg-violet-600/8 blur-[60px]" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Inteligência empresarial aplicada
          </div>
          <h1 className="text-[2.2rem] font-black text-white leading-[1.1] tracking-tight mb-4">
            Seu negócio tem respostas.<br />
            <span className="text-gradient">Nós sabemos as perguntas.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm mx-auto">
            A IA que investiga como sua empresa realmente funciona — e encontra onde tempo e dinheiro estão sendo perdidos.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={() => navigate('/cadastro')}
              className="w-full gradient-primary py-3.5 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-transform"
            >
              Começar diagnóstico grátis <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-2xl text-slate-300 font-medium text-base border border-white/8 bg-white/3 active:scale-[0.98] transition-transform"
            >
              Continuar diagnóstico
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-5">Sem cartão de crédito · Resultado em minutos</p>
        </div>
      </section>

      {/* Setores */}
      <section className="px-5 pb-10">
        <p className="text-center text-xs text-slate-500 uppercase tracking-widest font-semibold mb-5">Para qualquer segmento</p>
        <div className="grid grid-cols-4 gap-2.5">
          {sectors.map(s => (
            <div key={s.name} className="bg-[#0F1422] border border-white/6 rounded-2xl flex flex-col items-center gap-1.5 py-3 px-1">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-[10px] text-slate-400 text-center leading-tight font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Citação central */}
      <section className="px-5 pb-12">
        <div className="relative rounded-3xl overflow-hidden bg-[#0F1422] border border-indigo-500/20 p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none" />
          <p className="relative text-white font-bold text-xl leading-tight mb-2">
            "O cliente conhece a empresa dele.<br />
            Você conhece processos.<br />
            <span className="text-gradient">A IA conecta os dois."</span>
          </p>
          <p className="text-slate-500 text-xs mt-3">— Método ProcessAI</p>
        </div>
      </section>

      {/* Método C.O.N.T.E.X.T.O. */}
      <section className="px-5 pb-12">
        <div className="mb-5">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">Diferencial exclusivo</p>
          <h2 className="text-xl font-bold text-white">Método C.O.N.T.E.X.T.O.™</h2>
          <p className="text-slate-400 text-sm mt-1">8 dimensões de investigação por processo</p>
        </div>
        <div className="space-y-2">
          {contexto.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0F1422] border border-white/6">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <span className="text-white font-black text-base">{item.letter}</span>
              </div>
              <span className="text-slate-200 text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ciclo */}
      <section className="px-5 pb-12">
        <div className="mb-5">
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">Como funciona</p>
          <h2 className="text-xl font-bold text-white">Ciclo de melhoria contínua</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {cycle.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="bg-[#0F1422] border border-white/6 rounded-2xl flex items-center gap-3 p-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}18` }}>
                  <Icon size={15} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Etapa {i + 1}</p>
                  <p className="text-xs font-semibold text-white leading-tight">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* IA investigativa */}
      <section className="px-5 pb-12">
        <div className="mb-4">
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">IA investigativa</p>
          <h2 className="text-xl font-bold text-white">Não responde — investiga</h2>
        </div>
        <div className="space-y-3">
          <div className="bg-[#0F1422] border border-red-500/15 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400 mb-1.5">IA genérica <span className="text-slate-500 normal-case font-normal">— resposta vazia</span></p>
            <p className="text-sm text-slate-500 line-through">"Vamos criar um CRM para você."</p>
          </div>
          <div className="bg-[#0F1422] border border-emerald-500/15 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-400 mb-1.5">ProcessAI <span className="text-slate-500 normal-case font-normal">— investigação real</span></p>
            <p className="text-sm text-slate-200 leading-relaxed">"Quantas mensagens recebem por dia? Quem responde? Quanto tempo demora até o cliente ser atendido?"</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 pb-16">
        <div className="relative rounded-3xl overflow-hidden bg-[#0F1422] border border-indigo-500/20 px-6 py-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-violet-600/6 to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-2">Pronto para descobrir?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Em 15 minutos a IA já entende onde sua empresa perde tempo e dinheiro.
            </p>
            <button
              onClick={() => navigate('/cadastro')}
              className="w-full gradient-primary py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-transform"
            >
              Começar agora — é grátis <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
