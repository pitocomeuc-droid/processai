import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Sector } from '@/types'

// ── Sectors ──────────────────────────────────────────────────────────────────
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

// ── Revenue ranges ────────────────────────────────────────────────────────────
const revenueRanges = [
  'Até R$ 20 mil/mês',
  'R$ 20 mil a R$ 50 mil/mês',
  'R$ 50 mil a R$ 100 mil/mês',
  'R$ 100 mil a R$ 300 mil/mês',
  'R$ 300 mil a R$ 1 milhão/mês',
  'Acima de R$ 1 milhão/mês',
  'Prefiro não informar',
]

// ── Respondent roles ──────────────────────────────────────────────────────────
const respondentRoles = [
  'Proprietário / Dono', 'Sócio', 'Diretor', 'Gerente',
  'Coordenador', 'Funcionário', 'Consultor', 'Outro',
]

// ── Areas ────────────────────────────────────────────────────────────────────
const allAreas = [
  'Administração', 'Financeiro', 'Compras', 'Estoque',
  'Comercial', 'Vendas', 'Atendimento', 'WhatsApp / Mensagens',
  'Marketing', 'Clientes / CRM', 'Operação', 'Produção',
  'Logística', 'Recursos Humanos', 'Gestão', 'Projetos',
  'Pós-venda', 'Qualidade', 'Manutenção', 'Outros',
]

// ── Operational questions ─────────────────────────────────────────────────────
const operationalQuestions = [
  {
    id: 'main_product',
    question: 'O que sua empresa vende ou entrega?',
    placeholder: 'Ex: Venda de pães e bolos artesanais para consumo no local e delivery',
    type: 'textarea',
  },
  {
    id: 'daily_flow',
    question: 'Descreva como funciona um dia típico na operação:',
    placeholder: 'Ex: Abrimos às 6h, recebemos fornecedores às 7h, preparamos produtos até 10h...',
    type: 'textarea',
  },
  {
    id: 'current_tools',
    question: 'Você usa algum sistema ou ferramenta de gestão atualmente?',
    placeholder: 'Ex: Planilha Excel, WhatsApp, nenhum sistema...', type: 'text',
  },
  {
    id: 'goal_90days',
    question: 'Qual seria o resultado ideal para você nos próximos 90 dias?',
    placeholder: 'Ex: Reduzir erros de pedido a zero e atender 20% mais clientes...',
    type: 'textarea',
  },
]

type Step = 'sector' | 'info' | 'areas' | 'desires' | 'questions' | 'done'

export function Onboarding() {
  const navigate = useNavigate()
  const { user, setCompany, setOnboardingAnswers, setOnboardingComplete } = useStore()

  useEffect(() => {
    if (user?.email === 'pitocomeuc@gmail.com') navigate('/admin', { replace: true })
  }, [user, navigate])

  const [step, setStep] = useState<Step>('sector')
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)

  // Step: info
  const [companyName, setCompanyName] = useState('')
  const [employees, setEmployees] = useState('')
  const [businessAge, setBusinessAge] = useState('')
  const [revenueRange, setRevenueRange] = useState('')
  const [respondent, setRespondent] = useState('')
  const [respondentFunction, setRespondentFunction] = useState('')

  // Step: areas
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  // Step: desires (3 key questions)
  const [desireIndex, setDesireIndex] = useState(0)
  const [desireAnswers, setDesireAnswers] = useState<string[]>(['', '', ''])
  const [currentDesire, setCurrentDesire] = useState('')

  const desireQuestions = [
    {
      question: 'Se você pudesse resolver 3 problemas da sua empresa hoje, quais seriam?',
      placeholder: 'Ex: Controle de estoque, atendimento lento, retrabalho da equipe...',
      tip: 'Seja específico — cada problema vira uma oportunidade de melhoria real.',
    },
    {
      question: 'O que mais toma seu tempo (ou da sua equipe) atualmente?',
      placeholder: 'Ex: Responder WhatsApp o dia todo, montar relatórios manualmente...',
      tip: 'Tarefas que consomem tempo sem gerar valor direto são candidatas à automação.',
    },
    {
      question: 'Qual tarefa você gostaria de nunca mais precisar fazer manualmente?',
      placeholder: 'Ex: Contar estoque, digitar pedidos, fazer cobranças...',
      tip: 'Essa resposta costuma revelar a maior oportunidade de todo o diagnóstico.',
    },
  ]

  // Step: operational questions
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  const totalSteps = 5
  const stepNumber: Record<Step, number> = {
    sector: 1, info: 2, areas: 3, desires: 4, questions: 5, done: 5,
  }

  // ── SECTOR ──────────────────────────────────────────────────────────────────
  if (step === 'sector') {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
        <ProgressBar current={1} total={totalSteps} label="Segmento" />
        <h2 className="text-xl font-bold text-white mb-1">Qual é o seu segmento?</h2>
        <p className="text-slate-400 text-sm mb-6">Personalizamos o diagnóstico para o seu tipo de negócio.</p>
        <div className="grid grid-cols-2 gap-3 flex-1">
          {sectors.map(s => (
            <button key={s.id} onClick={() => setSelectedSector(s.id)}
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
        <Button fullWidth size="lg" onClick={() => {
          if (!selectedSector) return toast.error('Selecione seu segmento')
          setStep('info')
        }} className="mt-6">
          Continuar <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // ── INFO ────────────────────────────────────────────────────────────────────
  if (step === 'info') {
    const canContinue = companyName.trim() && revenueRange && respondent
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep('sector')} className="text-slate-400"><ArrowLeft size={20} /></button>
          <ProgressBar current={2} total={totalSteps} label="Sobre a empresa" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Sobre a empresa</h2>
        <p className="text-slate-400 text-sm mb-6">Precisamos entender o contexto do seu negócio.</p>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          <Field label="Nome da empresa *">
            <input value={companyName} onChange={e => setCompanyName(e.target.value)}
              placeholder="Ex: Padaria do João"
              className="input-base" />
          </Field>

          <Field label="Quantas pessoas trabalham?">
            <input value={employees} onChange={e => setEmployees(e.target.value)}
              placeholder="Ex: 5 funcionários"
              className="input-base" />
          </Field>

          <Field label="Há quanto tempo a empresa existe?">
            <select value={businessAge} onChange={e => setBusinessAge(e.target.value)} className="input-base">
              <option value="">Selecione...</option>
              {['Menos de 1 ano', '1 a 2 anos', '2 a 5 anos', '5 a 10 anos', 'Mais de 10 anos'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Faturamento médio mensal *">
            <div className="space-y-2">
              {revenueRanges.map(r => (
                <button key={r} onClick={() => setRevenueRange(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    revenueRange === r
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                      : 'bg-[#1E1E2E] border-white/8 text-slate-400 active:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Quem está respondendo este diagnóstico? *">
            <div className="grid grid-cols-2 gap-2">
              {respondentRoles.map(r => (
                <button key={r} onClick={() => setRespondent(r)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    respondent === r
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                      : 'bg-[#1E1E2E] border-white/8 text-slate-400 active:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Qual é a sua função exata?">
            <input value={respondentFunction} onChange={e => setRespondentFunction(e.target.value)}
              placeholder="Ex: Sou o dono e cuido das finanças"
              className="input-base" />
          </Field>
        </div>

        <Button fullWidth size="lg" disabled={!canContinue} onClick={() => setStep('areas')} className="mt-4">
          Continuar <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // ── AREAS ───────────────────────────────────────────────────────────────────
  if (step === 'areas') {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep('info')} className="text-slate-400"><ArrowLeft size={20} /></button>
          <ProgressBar current={3} total={totalSteps} label="Áreas da empresa" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Quais áreas existem na empresa?</h2>
        <p className="text-slate-400 text-sm mb-5">Marque todas as que se aplicam. A IA foca no diagnóstico das áreas selecionadas.</p>

        <div className="flex-1 overflow-y-auto pb-4">
          <div className="grid grid-cols-2 gap-2">
            {allAreas.map(area => {
              const active = selectedAreas.includes(area)
              return (
                <button key={area} onClick={() => toggleArea(area)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${
                    active
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                      : 'bg-[#1E1E2E] border-white/8 text-slate-400 active:bg-white/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    active ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                  }`}>
                    {active && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="leading-tight">{area}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Button fullWidth size="lg" disabled={selectedAreas.length === 0}
          onClick={() => { setDesireIndex(0); setCurrentDesire(''); setStep('desires') }} className="mt-4">
          Continuar ({selectedAreas.length} selecionadas) <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // ── DESIRES ─────────────────────────────────────────────────────────────────
  if (step === 'desires') {
    const dq = desireQuestions[desireIndex]
    const handleDesireNext = () => {
      if (!currentDesire.trim()) return toast.error('Responda a pergunta para continuar')
      const updated = [...desireAnswers]
      updated[desireIndex] = currentDesire
      setDesireAnswers(updated)
      setCurrentDesire('')
      if (desireIndex < desireQuestions.length - 1) {
        setDesireIndex(i => i + 1)
      } else {
        setAnswers(prev => ({ ...prev, three_problems: updated[0], time_wasters: updated[1], manual_task: updated[2] }))
        setStep('questions')
      }
    }

    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => {
            if (desireIndex > 0) { setDesireIndex(i => i - 1); setCurrentDesire(desireAnswers[desireIndex - 1]) }
            else setStep('areas')
          }} className="text-slate-400"><ArrowLeft size={20} /></button>
          <ProgressBar current={4} total={totalSteps} label={`Pergunta ${desireIndex + 1} de 3`} />
        </div>

        <div className="flex-1">
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">
            Pergunta essencial {desireIndex + 1}/3
          </p>
          <h2 className="text-xl font-bold text-white mb-3 leading-snug">{dq.question}</h2>
          <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2 mb-5">
            <p className="text-[11px] text-indigo-300">{dq.tip}</p>
          </div>

          <textarea
            value={currentDesire}
            onChange={e => setCurrentDesire(e.target.value)}
            placeholder={dq.placeholder}
            rows={5}
            className="w-full bg-[#1E1E2E] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all p-4 resize-none text-base"
          />
        </div>

        <Button fullWidth size="lg" onClick={handleDesireNext} className="mt-6">
          {desireIndex < desireQuestions.length - 1 ? 'Próxima' : 'Continuar'}
          <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // ── OPERATIONAL QUESTIONS ───────────────────────────────────────────────────
  if (step === 'questions') {
    const currentQ = operationalQuestions[questionIndex]
    const progress = questionIndex / operationalQuestions.length

    const handleNext = () => {
      if (!currentAnswer.trim()) return toast.error('Responda a pergunta para continuar')
      const updated = { ...answers, [currentQ.id]: currentAnswer }
      setAnswers(updated)
      setCurrentAnswer('')
      if (questionIndex < operationalQuestions.length - 1) {
        setQuestionIndex(i => i + 1)
      } else {
        handleFinish(updated)
      }
    }

    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => {
            if (questionIndex > 0) { setQuestionIndex(i => i - 1) }
            else setStep('desires')
          }} className="text-slate-400"><ArrowLeft size={20} /></button>
          <div className="flex-1 bg-[#1E1E2E] rounded-full h-2">
            <div className="gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(4 / totalSteps + progress / totalSteps) * 100}%` }} />
          </div>
          <span className="text-xs text-slate-500">{questionIndex + 1}/{operationalQuestions.length}</span>
        </div>

        <div className="flex-1">
          <p className="text-xs text-indigo-400 font-medium mb-2 uppercase tracking-wide">Operação</p>
          <h2 className="text-xl font-bold text-white mb-6 leading-snug">{currentQ.question}</h2>

          {currentQ.type === 'textarea' ? (
            <textarea value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
              placeholder={currentQ.placeholder} rows={5}
              className="w-full bg-[#1E1E2E] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all p-4 resize-none text-base" />
          ) : (
            <input type="text" value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
              placeholder={currentQ.placeholder} onKeyDown={e => e.key === 'Enter' && handleNext()}
              className="input-base" />
          )}
        </div>

        <Button fullWidth size="lg" onClick={handleNext} loading={loading} className="mt-6">
          {questionIndex < operationalQuestions.length - 1 ? 'Próxima' : 'Finalizar diagnóstico'}
          <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Diagnóstico concluído!</h2>
        <p className="text-slate-400 mb-2">Seu perfil empresarial foi criado.</p>
        <p className="text-indigo-400 text-sm mb-8">A IA já analisou suas áreas e está pronta para investigar seus processos.</p>
        <Button size="lg" fullWidth onClick={() => navigate('/dashboard')}>
          Ver meu painel <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  return null

  // ── FINISH ──────────────────────────────────────────────────────────────────
  async function handleFinish(finalAnswers: Record<string, string>) {
    if (!user || !selectedSector) return
    setLoading(true)
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: companyName || 'Minha Empresa',
          sector: selectedSector,
          owner_id: user.id,
          health_score: 50,
        })
        .select()
        .single()

      if (error) throw error

      // Build all answers
      const allQuestions = [
        { id: 'company_name', question: 'Nome da empresa', answer: companyName },
        { id: 'employees', question: 'Quantidade de funcionários', answer: employees },
        { id: 'business_age', question: 'Tempo de empresa', answer: businessAge },
        { id: 'revenue_range', question: 'Faturamento médio mensal', answer: revenueRange },
        { id: 'respondent', question: 'Quem respondeu o diagnóstico', answer: respondent },
        { id: 'respondent_function', question: 'Função de quem respondeu', answer: respondentFunction },
        { id: 'areas', question: 'Áreas da empresa', answer: selectedAreas.join(', ') },
        { id: 'three_problems', question: 'Se pudesse resolver 3 problemas hoje, quais seriam?', answer: finalAnswers.three_problems ?? desireAnswers[0] },
        { id: 'time_wasters', question: 'O que mais toma seu tempo atualmente?', answer: finalAnswers.time_wasters ?? desireAnswers[1] },
        { id: 'manual_task', question: 'Qual tarefa nunca mais gostaria de fazer manualmente?', answer: finalAnswers.manual_task ?? desireAnswers[2] },
        ...operationalQuestions.map(q => ({
          id: q.id,
          question: q.question,
          answer: finalAnswers[q.id] ?? '',
        })),
      ].filter(a => a.answer)

      const answersToSave = allQuestions.map(q => ({
        company_id: company.id,
        question_id: q.id,
        question: q.question,
        answer: q.answer,
      }))

      await supabase.from('onboarding_answers').insert(answersToSave)

      setCompany(company)
      setOnboardingAnswers(answersToSave)
      setOnboardingComplete(true)

      // Notify admin (non-blocking)
      const sectorLabel = sectors.find(s => s.id === selectedSector)?.label ?? selectedSector
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          type: 'admin-onboarding',
          adminData: {
            ownerName: user.name,
            ownerEmail: user.email,
            companyName: company.name,
            sector: sectorLabel,
            answers: answersToSave.map(a => ({ question: a.question, answer: a.answer })),
          },
        }),
      }).catch(() => {})

      setStep('done')
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
}

// ── Helper components ─────────────────────────────────────────────────────────
function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
        <span className="text-[10px] text-slate-500">{current}/{total}</span>
      </div>
      <div className="bg-[#1E1E2E] rounded-full h-1.5">
        <div className="gradient-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}
