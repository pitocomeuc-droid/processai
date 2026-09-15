import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, CheckCircle2, ChevronRight, Lightbulb } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getQuestionsForAreas, mandatoryOwnerQuestions } from '@/lib/questionBank'

const PLAN_START = '<<<PLANO>>>'
const PLAN_END = '<<<FIM>>>'
const INSIGHTS_START = '<<<INSIGHTS>>>'
const INSIGHTS_END = '<<<FIM_INSIGHTS>>>'

interface PlanoIA {
  titulo: string
  metodologia: string
  tarefas: {
    titulo: string
    descricao: string
    prioridade: 'alta' | 'media' | 'baixa'
    prazo_dias: number
    impacto: string
  }[]
  kpis: string[]
  resumo: string
  solucoes_possiveis: {
    tipo: string        // 'app' | 'automacao' | 'formulario' | 'relatorio' | 'site'
    titulo: string
    descricao: string
    beneficio: string
  }[]
}

interface ClientContext {
  type: string
  content: string
  created_at: string
}

interface InsightItem {
  type: 'fato' | 'hipotese' | 'oportunidade' | 'problema' | 'solucao'
  category: string
  fact: string
  confidence: 'alta' | 'media' | 'baixa'
  time_estimate?: string
  financial_impact?: string
}

const suggestions = [
  'Se eu pudesse resolver 3 problemas hoje: controle de estoque, demora no atendimento e retrabalho',
  'Minha equipe perde muito tempo em tarefas que poderiam ser automáticas',
  'Quero entender onde estou perdendo dinheiro sem perceber',
  'Preciso de um sistema para acompanhar minha equipe e resultados',
]

function parseInsights(text: string): { text: string; insights: InsightItem[] } {
  const start = text.indexOf(INSIGHTS_START)
  const end = text.indexOf(INSIGHTS_END)
  if (start === -1 || end === -1) return { text, insights: [] }
  const cleaned = (text.slice(0, start) + text.slice(end + INSIGHTS_END.length)).trim()
  const jsonStr = text.slice(start + INSIGHTS_START.length, end).trim()
  try {
    const parsed = JSON.parse(jsonStr)
    return { text: cleaned, insights: parsed.insights ?? [] }
  } catch {
    return { text: cleaned, insights: [] }
  }
}

function parsePlan(text: string): { visible: string; plan: PlanoIA | null } {
  const start = text.indexOf(PLAN_START)
  const end = text.indexOf(PLAN_END)
  if (start === -1 || end === -1) return { visible: text, plan: null }
  const visible = text.slice(0, start).trim()
  const jsonStr = text.slice(start + PLAN_START.length, end).trim()
  try {
    return { visible, plan: JSON.parse(jsonStr) }
  } catch {
    return { visible, plan: null }
  }
}

const typeIcon: Record<string, string> = {
  app: '📱', automacao: '⚡', formulario: '📋', relatorio: '📊', site: '🌐', outro: '🔧',
}

function PlanCard({ plan, saved }: { plan: PlanoIA; saved: boolean }) {
  const [showSolutions, setShowSolutions] = useState(true)
  const prioColor = (p: string) =>
    p === 'alta' ? 'text-red-400 bg-red-400/10' :
    p === 'media' ? 'text-amber-400 bg-amber-400/10' :
    'text-emerald-400 bg-emerald-400/10'

  return (
    <div className="mt-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-500/20">
        {saved
          ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          : <Sparkles size={15} className="text-indigo-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{plan.titulo}</p>
          <p className="text-[10px] text-indigo-300">{plan.metodologia} · {plan.tarefas.length} ações geradas</p>
        </div>
        {saved && <span className="text-[10px] text-emerald-400 shrink-0">✓ Salvo</span>}
      </div>

      {/* Tarefas */}
      <div className="px-4 py-3 space-y-2">
        {plan.tarefas.map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <ChevronRight size={12} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-medium text-slate-200">{t.titulo}</p>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase', prioColor(t.prioridade))}>
                  {t.prioridade}
                </span>
                <span className="text-[9px] text-slate-500">{t.prazo_dias}d</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs */}
      {plan.kpis.length > 0 && (
        <div className="px-4 py-2 border-t border-indigo-500/15 bg-indigo-500/5">
          <p className="text-[9px] text-indigo-300 font-bold uppercase mb-1">Métricas</p>
          <div className="flex flex-wrap gap-1">
            {plan.kpis.map((k, i) => (
              <span key={i} className="text-[10px] bg-[#1E1E2E] text-slate-300 px-2 py-0.5 rounded-full border border-white/8">{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Soluções que podemos construir */}
      {plan.solucoes_possiveis?.length > 0 && (
        <div className="border-t border-amber-500/20 bg-amber-500/5">
          <button
            onClick={() => setShowSolutions(!showSolutions)}
            className="w-full flex items-center gap-2 px-4 py-2.5"
          >
            <Lightbulb size={13} className="text-amber-400" />
            <p className="text-xs font-semibold text-amber-300 flex-1 text-left">
              {plan.solucoes_possiveis.length} solução{plan.solucoes_possiveis.length > 1 ? 'ões' : ''} que podemos criar para você
            </p>
            <span className="text-[10px] text-amber-400">{showSolutions ? '▲' : '▼'}</span>
          </button>

          {showSolutions && (
            <div className="px-4 pb-3 space-y-2">
              {plan.solucoes_possiveis.map((s, i) => (
                <div key={i} className="bg-[#1E1E2E] rounded-xl p-3 border border-amber-500/15">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{typeIcon[s.tipo] ?? '🔧'}</span>
                    <p className="text-xs font-semibold text-white">{s.titulo}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-1.5">{s.descricao}</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                    <p className="text-[10px] text-emerald-400">{s.beneficio}</p>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-amber-300/70 text-center pt-1">
                Nosso time pode tirar essas soluções do papel e colocar no seu celular. Aguarde contato.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Chat() {
  const { user, company, messages, addMessage, onboardingAnswers } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set())
  const [clientContext, setClientContext] = useState<ClientContext[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Carregar contexto acumulado do cliente
  useEffect(() => {
    if (!company?.id) return
    supabase
      .from('client_context')
      .select('type, content, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setClientContext((data as ClientContext[]) ?? []))
  }, [company])

  // Salvar nova mensagem como contexto
  const saveToContext = async (content: string, type: 'problema' | 'objetivo' | 'feedback') => {
    if (!company?.id || content.length < 20) return
    await supabase.from('client_context').insert({
      company_id: company.id,
      type,
      content: content.slice(0, 1000),
      source: 'chat',
    })
    setClientContext(prev => [{ type, content, created_at: new Date().toISOString() }, ...prev].slice(0, 30))
  }

  const buildSystemPrompt = () => {
    const answersText = onboardingAnswers.length > 0
      ? onboardingAnswers.map(a => `• ${a.question}: ${a.answer}`).join('\n')
      : 'Diagnóstico inicial não realizado ainda.'

    const contextText = clientContext.length > 0
      ? clientContext.slice(0, 20).map(c => `[${c.type}] ${c.content}`).join('\n')
      : 'Nenhum histórico de conversas ainda.'

    // Extrair áreas selecionadas no onboarding
    const areasAnswer = onboardingAnswers.find(a => a.question_id === 'areas')
    const selectedAreas = areasAnswer ? areasAnswer.answer.split(',').map(a => a.trim()) : []
    const areaQuestions = getQuestionsForAreas(selectedAreas)

    const areaQuestionsText = areaQuestions.length > 0
      ? areaQuestions.map(aq =>
          `\n[${aq.area.toUpperCase()}]\n${aq.questions.map(q => `  • ${q}`).join('\n')}`
        ).join('\n')
      : 'Nenhuma área específica selecionada — investigue as áreas principais do negócio.'

    // Verificar se é dono/sócio para incluir perguntas obrigatórias
    const respondentAnswer = onboardingAnswers.find(a => a.question_id === 'respondent')
    const isOwner = respondentAnswer
      ? ['Proprietário / Dono', 'Sócio', 'Diretor'].some(r => respondentAnswer.answer.includes(r))
      : false

    const ownerQuestionsText = isOwner
      ? `\n━━━ PERGUNTAS OBRIGATÓRIAS PARA O DONO ━━━
Estas perguntas DEVEM ser feitas ao longo das conversas — são críticas para entender a dependência do dono:
${mandatoryOwnerQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
→ As respostas a essas perguntas viram processos documentados.`
      : ''

    return `Você é a INTELIGÊNCIA EMPRESARIAL do ProcessAI.

Sua missão NÃO é responder perguntas — é COMPREENDER PROFUNDAMENTE como cada empresa funciona, descobrir gargalos, tarefas manuais, desperdícios, retrabalho, falhas de comunicação e oportunidades de melhoria real.

━━━ MÉTODO C.O.N.T.E.X.T.O.™ ━━━
Para qualquer processo ou problema investigado, passe pelas 8 dimensões:
C — Como funciona hoje?
O — Onde está o problema?
N — Necessidade real do cliente?
T — Tempo gasto nesse processo?
E — Erros e desperdícios que ocorrem?
X — Experiência desejada (como deveria ser)?
T — Tecnologia atual usada?
O — Objetivo final esperado?

━━━ REGRA FUNDAMENTAL — NUNCA CONCLUA NA PRIMEIRA RESPOSTA ━━━
Antes de gerar qualquer diagnóstico ou solução, você deve entender:
- Como funciona hoje / Quem faz / Quando / Onde registra
- Quanto tempo demora / Quantas vezes acontece
- Quais erros ocorrem / Qual a consequência / Quanto isso custa
- O que já tentaram / Qual seria o resultado ideal

DIFERENÇA CRÍTICA — SEMPRE DIFERENCIE:
- FATO INFORMADO (Alta confiança): o que o cliente disse explicitamente → confirme como "fato"
- HIPÓTESE DA IA (Média/Baixa confiança): o que você deduziu mas não foi confirmado → confirme como "hipotese"
NUNCA invente números ou afirme algo como fato se não foi informado pelo cliente.

━━━ CÁLCULO DE TEMPO E IMPACTO FINANCEIRO ━━━
Sempre que o cliente mencionar uma tarefa manual ou processo com tempo envolvido:
1. Pergunte: "Quanto tempo isso leva?" e "Com que frequência acontece?"
2. Calcule: [tempo] × [frequência] = impacto mensal
   Exemplos:
   • 30 min × 26 dias úteis = 13h/mês desperdiçadas
   • 2h × 4 vezes/semana = 32h/mês = quase 4 dias de trabalho perdidos
   • 1h/dia × 22 dias = 22h/mês ≈ R$ 1.500/mês em mão de obra (salário mínimo)
3. Mostre o impacto anual: "Isso representa X horas ou R$ Y por ano."

━━━ CLASSIFICAÇÃO DE INFORMAÇÕES ━━━
Ao identificar informações relevantes na conversa, classifique-as internamente:
- fato: confirmado pelo cliente (alta/media confiança)
- hipotese: deduzido pela IA, não confirmado (baixa confiança)
- problema: gargalo ou dificuldade identificada
- oportunidade: melhoria concreta que pode ser implementada
- solucao: algo que o nosso time pode construir

━━━ COMO INVESTIGAR ━━━
Quando o cliente mencionar um problema:
1. Faça 1-2 perguntas de aprofundamento naturais e empáticas
2. Ouça a resposta e aprofunde mais se ainda faltar contexto
3. Após 3-4 trocas com informação suficiente → gere o diagnóstico estruturado
4. Conecte informações de setores diferentes quando relevante

EXEMPLO CERTO:
Cliente: "Tenho problema com meu WhatsApp"
ERRADO: "Vamos criar um CRM para você."
CERTO: "Entendo. Para te ajudar melhor: quantas mensagens vocês recebem por dia? Tem só um WhatsApp ou vários números? Como sabem quem já foi atendido?"

━━━ NUNCA SUGIRA FERRAMENTAS DE TERCEIROS ━━━
Não diga "use WhatsApp Business", "use Google Sheets" ou "configure um CRM".
Não dê tutoriais de ferramentas. Não explique como o cliente pode resolver sozinho.
Mostre o que O NOSSO TIME pode construir e entregar — e gere desejo por isso.

━━━ PERFIL DO CLIENTE ━━━
Empresa: ${company?.name ?? 'Não informado'}
Setor: ${company?.sector ?? 'Não informado'}
Áreas da empresa: ${selectedAreas.join(', ') || 'Não informado'}

Respostas do diagnóstico inicial:
${answersText}

Histórico acumulado de conversas anteriores:
${contextText}
${ownerQuestionsText}

━━━ BANCO DE PERGUNTAS POR ÁREA ━━━
Use essas perguntas como GUIA de investigação para as áreas desta empresa.
NÃO faça todas de uma vez — use-as naturalmente conforme o cliente fala de cada área:
${areaQuestionsText}

━━━ LINGUAGEM ━━━
- Empático e direto, como um consultor de confiança
- Português brasileiro informal mas profissional
- NUNCA genérico — sempre adaptado ao setor (${company?.sector ?? 'negócio'}) e ao contexto do cliente
- Quando citar histórico: "Você já mencionou que..." ou "Na nossa última conversa..."
- Quando citar hipótese: "Imagino que pode estar acontecendo..." ou "Uma possibilidade é que..."

━━━ QUANDO EMITIR INSIGHTS ━━━
Ao identificar fatos, hipóteses, problemas ou oportunidades na conversa, emita ao final da resposta:

${INSIGHTS_START}
{
  "insights": [
    {
      "type": "fato|hipotese|problema|oportunidade|solucao",
      "category": "vendas|estoque|financeiro|rh|whatsapp|operacao|marketing|compras|gestao|outro",
      "fact": "Descrição clara e objetiva do que foi identificado",
      "confidence": "alta|media|baixa",
      "time_estimate": "Ex: 30min × 26 dias = 13h/mês (ou null se não calculável)",
      "financial_impact": "Ex: R$ 2.000/mês estimado (ou null se não calculável)"
    }
  ]
}
${INSIGHTS_END}

REGRAS para insights:
- Emita apenas quando houver informação nova e relevante identificada na conversa
- Confidence "alta" = cliente afirmou explicitamente
- Confidence "media" = contexto sugere fortemente
- Confidence "baixa" = hipótese da IA baseada em padrões do setor
- time_estimate e financial_impact só quando houver dados suficientes para calcular
- Máximo 3 insights por resposta — priorize os mais relevantes

━━━ QUANDO GERAR PLANO ━━━
Somente após investigação suficiente (mínimo 3 trocas sobre o problema).
Ao gerar, inclua SEMPRE ao final:

${PLAN_START}
{
  "titulo": "Nome descritivo do diagnóstico",
  "metodologia": "PDCA|Lean|Kaizen|5S|5 Porquês",
  "tarefas": [
    {
      "titulo": "Nome da oportunidade identificada",
      "descricao": "O que está acontecendo hoje e qual o impacto negativo disso na empresa",
      "prioridade": "alta|media|baixa",
      "prazo_dias": null,
      "impacto": "O que muda concretamente quando isso for resolvido"
    }
  ],
  "kpis": ["Indicador que vai melhorar 1", "Indicador que vai melhorar 2"],
  "resumo": "Uma frase: qual transformação esse diagnóstico revela",
  "solucoes_possiveis": [
    {
      "tipo": "app|automacao|formulario|relatorio|site",
      "titulo": "Nome da solução que nosso time pode construir",
      "descricao": "O que essa solução faz especificamente para este cliente neste setor",
      "beneficio": "Resultado concreto: ex: elimina 3h/semana de trabalho manual, reduz erros em 80%"
    }
  ]
}
${PLAN_END}

REGRAS para o plano — LIMITAÇÃO ESTRATÉGICA (muito importante):
- As "tarefas" do plano descrevem OPORTUNIDADES IDENTIFICADAS, não passos de implementação
- NUNCA explique como implementar a solução — isso é o trabalho do nosso time
- NÃO dê tutoriais, roteiros ou passo a passo de como resolver
- Mostre claramente O PROBLEMA e O RESULTADO esperado, mas deixe o COMO em aberto
- Gere 2 a 3 soluções REAIS que um time de desenvolvimento pode construir
- Específicas para o setor e problema relatado (não genéricas)
- Restaurante com problema de pedidos → "App de comanda digital" ou "Painel de pedidos em tempo real"
- Clínica → "App de agendamento online" ou "Relatório automático de consultas"
- Loja → "Sistema de controle de estoque com alertas" ou "Dashboard de vendas diárias"
- NÃO sugira ferramentas de terceiros — diga o que NOSSO TIME vai construir e entregar

━━━ REGRA DE OURO — CRIAR DESEJO, NÃO ENTREGAR TUDO ━━━
Após identificar a oportunidade e apresentar o diagnóstico:
- Mostre o PROBLEMA com clareza e o IMPACTO que ele causa (tempo, dinheiro, erros)
- Apresente a SOLUÇÃO pelo nome e pelo RESULTADO que ela traz — não pelo como funciona
- Use frases como: "Nosso time já construiu soluções assim para empresas do seu setor."
- Termine sempre com uma abertura para o próximo passo com o time:
  "Quer que a gente mostre como ficaria isso para a sua empresa especificamente?"
  "Posso pedir para nosso time preparar uma proposta com base no que você me contou?"
  "Se quiser avançar, nosso time consegue detalhar exatamente o que seria construído para vocês."
- NUNCA entregue o roteiro completo de implementação — a curiosidade é o que move o cliente para a próxima etapa
- Foco em soluções mobile-first que cabem no celular do cliente`
  }

  const savePlan = async (msgId: string, plan: PlanoIA, problemText: string) => {
    if (!company?.id || savedPlans.has(msgId)) return
    setSavedPlans(prev => new Set([...prev, msgId]))

    const dueBase = new Date()
    const rows = plan.tarefas.map(t => {
      const due = new Date(dueBase)
      due.setDate(due.getDate() + t.prazo_dias)
      return {
        company_id: company.id,
        title: t.titulo,
        description: `${t.descricao}\n\nImpacto esperado: ${t.impacto}`,
        priority: (['alta', 'media', 'baixa'] as const).includes(t.prioridade as 'alta') ? t.prioridade : 'media',
        status: 'pendente',
        due_date: due.toISOString().split('T')[0],
        methodology: plan.metodologia,
        impact: t.impacto,
      }
    })

    const { error } = await supabase.from('improvement_tasks').insert(rows)
    if (error) {
      toast.error('Erro ao salvar tarefas')
      setSavedPlans(prev => { const s = new Set(prev); s.delete(msgId); return s })
      return
    }

    toast.success(`✅ ${rows.length} ações salvas em Melhorias!`)

    // Salvar problema como contexto permanente
    await saveToContext(problemText, 'problema')

    // Notificar admin
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user?.email,
        type: 'admin-plan',
        adminData: {
          ownerName: user?.name ?? '',
          ownerEmail: user?.email ?? '',
          companyName: company.name,
          sector: company.sector,
          problem: problemText,
          planTitle: plan.titulo,
          methodology: plan.metodologia,
          tasks: plan.tarefas,
          kpis: plan.kpis,
        },
      }),
    }).catch(() => {})
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      created_at: new Date().toISOString(),
    }
    addMessage(userMsg)
    setLoading(true)

    try {
      const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }))

      const { data } = await axios.post('/api/chat', {
        system: buildSystemPrompt(),
        messages: [...history, { role: 'user', content: text }],
      })

      // Extrair insights antes de exibir (remove bloco do texto visível)
      const { text: textWithoutInsights, insights } = parseInsights(data.content)

      // Salvar insights no banco silenciosamente
      if (insights.length > 0 && company?.id) {
        const rows = insights.map(i => ({
          company_id: company.id,
          type: i.type,
          category: i.category,
          fact: i.fact,
          confidence: i.confidence,
          time_estimate: i.time_estimate ?? null,
          financial_impact: i.financial_impact ?? null,
          source: 'chat',
        }))
        supabase.from('ai_memories').insert(rows).then(({ error }) => {
          if (error) console.error('insights save error', error)
        })
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: textWithoutInsights,
        created_at: new Date().toISOString(),
      }
      addMessage(assistantMsg)

      const { plan } = parsePlan(textWithoutInsights)
      if (plan) {
        await savePlan(assistantMsg.id, plan, text)
      }
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, erro de conexão. Tente novamente.',
        created_at: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const adjustTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="glass border-b border-white/6 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Consultor ProcessAI</p>
          <p className="text-[10px] text-emerald-400">
            ● {clientContext.length > 0 ? `Contexto com ${clientContext.length} informações suas` : 'Pronto para analisar seu negócio'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <p className="text-white font-semibold mb-1">
              {clientContext.length > 0
                ? `Olá de novo, ${user?.name?.split(' ')[0]}!`
                : `Olá, ${user?.name?.split(' ')[0]}!`}
            </p>
            <p className="text-slate-400 text-sm mb-2 px-4">
              {clientContext.length > 0
                ? 'Lembro das nossas conversas anteriores. O que mais posso analisar hoje?'
                : 'Descreva um problema real da sua empresa. Vou analisar e mostrar o que nosso time pode construir para você.'}
            </p>
            <p className="text-indigo-400 text-xs mb-6">PDCA · Lean · Kaizen · Soluções reais</p>

            <div className="space-y-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="w-full text-left bg-[#1E1E2E] border border-white/6 rounded-xl px-4 py-3 text-sm text-slate-300 hover:border-indigo-500/40 transition-all active:scale-98">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          const { visible, plan } = parsePlan(msg.content)
          return (
            <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={13} className="text-white" />
                </div>
              )}
              <div className={cn('max-w-[88%]')}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-[#1E1E2E] text-slate-200 rounded-tl-sm border border-white/6'
                )}>
                  {visible || msg.content}
                </div>
                {plan && <PlanCard plan={plan} saved={savedPlans.has(msg.id)} />}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#2A2A3E] flex items-center justify-center shrink-0 mt-0.5">
                  <User size={13} className="text-slate-400" />
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-[#1E1E2E] border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="text-[11px] text-indigo-300 mr-1">Analisando</span>
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-white/6 px-4 pt-3 pb-3 shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
        <div className="flex items-end gap-2 bg-[#1E1E2E] border border-white/10 rounded-2xl px-3 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); adjustTextarea() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Descreva um problema ou objetivo do seu negócio..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 resize-none focus:outline-none text-sm leading-relaxed max-h-[120px] py-1"
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-90">
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-1.5">
          Tudo que você compartilha vira contexto para melhorar sua consultoria
        </p>
      </div>
    </div>
  )
}
