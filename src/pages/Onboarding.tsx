import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Sector } from '@/types'

const sectors: { id: Sector; emoji: string; label: string }[] = [
  { id: 'restaurante', emoji: '🍽️', label: 'Restaurante / Lanchonete' },
  { id: 'bar', emoji: '🍺', label: 'Bar / Pub' },
  { id: 'loja_fisica', emoji: '🏪', label: 'Loja Física / PDV' },
  { id: 'loja_online', emoji: '🛒', label: 'Loja Online / E-commerce' },
  { id: 'clinica', emoji: '🏥', label: 'Clínica / Saúde' },
  { id: 'oficina', emoji: '🔧', label: 'Oficina / Serviços Técnicos' },
  { id: 'escritorio', emoji: '💼', label: 'Escritório / Administração' },
  { id: 'outro', emoji: '🏢', label: 'Outro segmento' },
]

const questions = [
  { id: 'company_name', question: 'Qual é o nome da sua empresa?', placeholder: 'Ex: Padaria do João', type: 'text' },
  { id: 'employees', question: 'Quantas pessoas trabalham na sua empresa?', placeholder: 'Ex: 5 funcionários', type: 'text' },
  { id: 'main_product', question: 'Qual é o seu principal produto ou serviço?', placeholder: 'Ex: Venda de pães e bolos artesanais', type: 'textarea' },
  { id: 'daily_flow', question: 'Descreva como funciona um dia típico na sua operação:', placeholder: 'Ex: Abrimos às 6h, recebemos fornecedores, preparamos produtos...', type: 'textarea' },
  { id: 'biggest_problem', question: 'Qual é o maior problema ou gargalo que você enfrenta hoje?', placeholder: 'Ex: Muitos erros nos pedidos, demora no atendimento...', type: 'textarea' },
  { id: 'time_wasters', question: 'Quais tarefas consomem mais tempo da sua equipe desnecessariamente?', placeholder: 'Ex: Retrabalho, buscas por informações, comunicação lenta...', type: 'textarea' },
  { id: 'current_tools', question: 'Você usa algum sistema ou ferramenta de gestão atualmente?', placeholder: 'Ex: Planilha Excel, WhatsApp, sistema X...', type: 'text' },
  { id: 'error_frequency', question: 'Com que frequência ocorrem erros ou retrabalho? Qual o impacto?', placeholder: 'Ex: Todo dia há pelo menos 2 erros de pedido, gerando reclamações...', type: 'textarea' },
  { id: 'financial_impact', question: 'Quanto você estima que os problemas atuais custam por mês (em perdas, tempo ou retrabalho)?', placeholder: 'Ex: Uns R$ 2.000 em desperdício de insumos...', type: 'text' },
  { id: 'goal_90days', question: 'Qual seria o resultado ideal para você nos próximos 90 dias?', placeholder: 'Ex: Reduzir erros de pedido a zero e atender 20% mais clientes...', type: 'textarea' },
  { id: 'tried_before', question: 'O que você já tentou fazer para resolver esses problemas?', placeholder: 'Ex: Tentei treinar a equipe mas não funcionou...', type: 'textarea' },
  { id: 'decision_maker', question: 'Quem decide as mudanças na empresa? Você tem autonomia para implementar melhorias?', placeholder: 'Ex: Sou o dono e tenho autonomia total...', type: 'text' },
]

type Step = 'sector' | 'questions' | 'done'

export function Onboarding() {
  const navigate = useNavigate()
  const { user, setCompany, setOnboardingAnswers, setOnboardingComplete } = useStore()
  const [step, setStep] = useState<Step>('sector')
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const currentQ = questions[questionIndex]
  const progress = questionIndex / questions.length

  const handleSectorNext = () => {
    if (!selectedSector) return toast.error('Selecione seu setor')
    setStep('questions')
  }

  const handleAnswerNext = () => {
    if (!currentAnswer.trim()) return toast.error('Responda a pergunta para continuar')
    const updated = { ...answers, [currentQ.id]: currentAnswer }
    setAnswers(updated)
    setCurrentAnswer('')
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1)
    } else {
      handleFinish(updated)
    }
  }

  const handleFinish = async (finalAnswers: Record<string, string>) => {
    if (!user || !selectedSector) return
    setLoading(true)
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: finalAnswers.company_name || 'Minha Empresa',
          sector: selectedSector,
          owner_id: user.id,
          health_score: 50,
        })
        .select()
        .single()

      if (error) throw error

      const answersToSave = Object.entries(finalAnswers).map(([qId, answer]) => ({
        company_id: company.id,
        question_id: qId,
        question: questions.find((q) => q.id === qId)?.question || qId,
        answer,
      }))

      await supabase.from('onboarding_answers').insert(answersToSave)

      setCompany(company)
      setOnboardingAnswers(answersToSave)
      setOnboardingComplete(true)
      setStep('done')
    } catch (err) {
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Tudo certo!</h2>
        <p className="text-slate-400 mb-8">Seu painel personalizado está pronto. A IA já analisou suas respostas.</p>
        <Button size="lg" fullWidth onClick={() => navigate('/dashboard')}>
          Ver meu painel <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  if (step === 'sector') {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-white mb-1">Qual é o seu setor?</h2>
        <p className="text-slate-400 text-sm mb-6">Selecione o segmento da sua empresa para personalizar sua experiência.</p>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                selectedSector === s.id
                  ? 'bg-indigo-500/15 border-indigo-500/60 text-white'
                  : 'bg-[#1E1E2E] border-white/6 text-slate-400'
              }`}
            >
              <span className="text-3xl">{s.emoji}</span>
              <span className="text-sm font-medium text-center leading-tight">{s.label}</span>
            </button>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={handleSectorNext} className="mt-6">
          Continuar <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => questionIndex > 0 ? setQuestionIndex((i) => i - 1) : setStep('sector')}
          className="text-slate-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 bg-[#1E1E2E] rounded-full h-2">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">{questionIndex + 1}/{questions.length}</span>
      </div>

      <div className="flex-1">
        <p className="text-xs text-indigo-400 font-medium mb-2 uppercase tracking-wide">Pergunta {questionIndex + 1}</p>
        <h2 className="text-xl font-bold text-white mb-6 leading-snug">{currentQ.question}</h2>

        {currentQ.type === 'textarea' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQ.placeholder}
            rows={5}
            className="w-full bg-[#1E1E2E] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all p-4 resize-none text-base"
          />
        ) : (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQ.placeholder}
            onKeyDown={(e) => e.key === 'Enter' && handleAnswerNext()}
            className="w-full bg-[#1E1E2E] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all px-4 py-3 min-h-[48px] text-base"
          />
        )}
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handleAnswerNext}
        loading={loading}
        className="mt-6"
      >
        {questionIndex < questions.length - 1 ? 'Próxima' : 'Finalizar'}
        <ArrowRight size={18} />
      </Button>
    </div>
  )
}
