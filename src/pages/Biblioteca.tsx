import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, DollarSign, CheckCircle2, ChevronDown, ChevronUp, MessageSquare, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useStore } from '@/store/useStore'

interface Template {
  id: string
  title: string
  category: string
  sectors: string[]
  problem: string
  solution: string
  impact: string
  timeEstimate: string
  moneyEstimate: string
  steps: string[]
  methodology: string
}

const templates: Template[] = [
  {
    id: 'confirmacao-consultas',
    title: 'Confirmação Automática de Consultas',
    category: 'Automação',
    sectors: ['clinica', 'outro'],
    problem: 'No-show acima de 15% das consultas. Recepcionista gasta 2h/dia ligando para confirmar.',
    solution: 'Sistema automático de confirmação via WhatsApp 24h antes, com link de cancelamento e reagendamento.',
    impact: 'Redução de no-show para menos de 8%. Libera 2h/dia da recepcionista.',
    timeEstimate: '16h/mês economizadas',
    moneyEstimate: 'R$ 2.400-4.000/mês recuperados',
    methodology: 'Automação + PDCA',
    steps: [
      'Mapear lista de consultas do dia seguinte',
      'Enviar mensagem automática às 15h do dia anterior',
      'Cliente confirma com 1 clique ou aciona reagendamento',
      'Slot liberado automaticamente em caso de cancelamento',
      'Relatório semanal de no-show para gestão',
    ],
  },
  {
    id: 'controle-estoque-codigo',
    title: 'Controle de Estoque com Código de Barras',
    category: 'Processos',
    sectors: ['loja_fisica', 'loja_online', 'outro'],
    problem: 'Contagem manual de estoque toda semana: 4h paradas. Divergência de 10-15% vs sistema.',
    solution: 'Leitor de código de barras integrado ao sistema. Inventário em tempo real, alertas de estoque mínimo.',
    impact: 'Contagem semanal eliminada. Divergência para menos de 2%.',
    timeEstimate: '20h/mês economizadas',
    moneyEstimate: 'R$ 1.800-3.000/mês (redução de ruptura e furto)',
    methodology: 'Lean + 5S',
    steps: [
      'Cadastrar todos os produtos com código de barras',
      'Definir estoque mínimo por produto',
      'Configurar alerta automático de reposição',
      'Processo de entrada: escaneamento na recepção do produto',
      'Processo de saída: integrado ao PDV',
      'Relatório automático de itens críticos (domingo)',
    ],
  },
  {
    id: 'cardapio-digital-qr',
    title: 'Cardápio Digital via QR Code',
    category: 'Automação',
    sectors: ['restaurante', 'bar'],
    problem: 'Impressão de cardápios: R$ 1.200/ano. Atualização de preços: 40 min/dia de trabalho manual.',
    solution: 'QR code nas mesas que abre cardápio digital. Atualização de preços em segundos, sem impressão.',
    impact: 'Elimina custo de impressão. Libera 40min/dia dos garçons para atendimento.',
    timeEstimate: '12h/mês economizadas',
    moneyEstimate: 'R$ 1.200/ano em impressões + 40min/dia garçom',
    methodology: 'Kaizen',
    steps: [
      'Fotografar todos os pratos com qualidade',
      'Criar cardápio digital com categorias e preços',
      'Gerar QR codes únicos por mesa',
      'Plastificar QR code nas mesas',
      'Treinamento: como atualizar preços em 30 segundos',
      'Revisar cardápio digital toda segunda-feira',
    ],
  },
  {
    id: 'pipeline-comercial',
    title: 'Pipeline Comercial e Gestão de Propostas',
    category: 'Processos',
    sectors: ['escritorio', 'outro'],
    problem: 'Propostas geridas em planilha compartilhada. Follow-up feito por memória. 2 clientes perdidos por esquecimento.',
    solution: 'Pipeline visual com estágios (Lead → Proposta → Negociação → Fechamento). Alertas automáticos de follow-up.',
    impact: 'Zero clientes perdidos por esquecimento. Previsibilidade de receita.',
    timeEstimate: '8h/mês economizadas em organização',
    moneyEstimate: 'Recuperação de 1-2 contratos/mês (var. por ticket)',
    methodology: 'PDCA + Kanban',
    steps: [
      'Mapear todos os leads e prospects atuais',
      'Definir os estágios do processo de venda',
      'Configurar alertas de follow-up por prazo',
      'Criar template padrão de proposta',
      'Reunião semanal de 30min para revisar pipeline',
      'Dashboard de meta mensal vs realizado',
    ],
  },
  {
    id: 'escala-funcionarios-historico',
    title: 'Escala de Funcionários Baseada em Movimento',
    category: 'Processos',
    sectors: ['restaurante', 'bar', 'loja_fisica'],
    problem: 'Escala fixa mesmo com movimento variável. Horas extras nos picos, ociosidade nos vales.',
    solution: 'Análise de movimento por dia/hora nos últimos 3 meses. Escala otimizada com turnos flexíveis.',
    impact: 'Redução de 20-30% em horas extras. Atendimento melhor nos picos.',
    timeEstimate: 'Depende da operação',
    moneyEstimate: 'R$ 1.500-3.000/mês em horas extras evitadas',
    methodology: 'Lean + Análise de dados',
    steps: [
      'Coletar dados de vendas por hora dos últimos 90 dias',
      'Identificar padrões de pico e vale por dia da semana',
      'Redesenhar escala com turnos alinhados ao movimento',
      'Definir critérios para chamar reforço (ex: faturamento/hora)',
      'Revisar escala mensalmente com dados do mês anterior',
    ],
  },
  {
    id: 'faturamento-planos-saude',
    title: 'Faturamento Automático de Planos de Saúde',
    category: 'Processos',
    sectors: ['clinica'],
    problem: 'Faturamento manual em planilha. 2 dias/mês de trabalho. Erros de glosa custam R$ 1.500-2.500/mês.',
    solution: 'Sistema de faturamento integrado com guias automáticas. Pré-validação antes do envio para eliminar glosas.',
    impact: 'Elimina 2 dias de trabalho mensal. Reduz glosas para menos de 3%.',
    timeEstimate: '16h/mês economizadas',
    moneyEstimate: 'R$ 1.500-2.500/mês em glosas eliminadas',
    methodology: '5 Porquês + Poka-Yoke',
    steps: [
      'Mapear todos os planos e tabelas de cobertura',
      'Configurar checklist de preenchimento por tipo de consulta',
      'Validação automática antes do envio (campo obrigatório, código correto)',
      'Lote mensal com relatório de guias enviadas vs aprovadas',
      'Processo de reembolso de glosas com template de recurso',
    ],
  },
  {
    id: 'presenca-digital-redes',
    title: 'Presença Digital e Calendário de Conteúdo',
    category: 'Marketing',
    sectors: ['loja_fisica', 'loja_online', 'restaurante', 'clinica', 'outro'],
    problem: 'Postagens irregulares, sem planejamento. Engajamento baixo. Sem análise de horário ideal.',
    solution: 'Calendário mensal de conteúdo. Roteiro de posts por categoria. Análise de melhor horário por público.',
    impact: 'Consistência aumenta alcance orgânico em 3-5x em 60 dias.',
    timeEstimate: '4h/mês de planejamento vs improvisação diária',
    moneyEstimate: 'Alcance orgânico equivale a R$ 500-2.000/mês em anúncios',
    methodology: 'Content Marketing + Análise',
    steps: [
      'Definir 4 categorias de conteúdo (produto, bastidores, depoimentos, dica)',
      'Criar calendário com frequência mínima: 3x/semana',
      'Identificar melhor horário com Insights do Instagram',
      'Criar banco de fotos do produto/serviço (uma sessão de fotos)',
      'Reutilizar conteúdo: post → stories → reels',
      'Relatório mensal: quais posts geraram mais contato',
    ],
  },
  {
    id: 'relatorio-mensal-automatico',
    title: 'Relatório Mensal Automático para Clientes',
    category: 'Automação',
    sectors: ['escritorio', 'outro'],
    problem: 'Relatório mensal de resultados feito manualmente: 6h por cliente. Com 8 clientes = 48h/mês.',
    solution: 'Template de relatório com seções padrão. Automação de coleta de dados. Envio automático no dia 5 de cada mês.',
    impact: 'Relatório de 6h → 30 minutos por cliente.',
    timeEstimate: '44h/mês economizadas por consultor',
    moneyEstimate: 'Equivalente a R$ 8.800-15.000/mês em capacidade liberada',
    methodology: 'Automação + PDCA',
    steps: [
      'Definir seções padrão do relatório (resumo, atividades, resultados, próximos passos)',
      'Criar template editável em Notion ou Word',
      'Mapear fontes de dados que alimentam cada seção',
      'Configurar automação de coleta de métricas',
      'Processo de revisão: 30 min/cliente no dia 3',
      'Envio automático no dia 5 de cada mês',
    ],
  },
]

const categories = ['Todos', 'Automação', 'Processos', 'Marketing']

interface TemplateCardProps {
  template: Template
  expanded: string | null
  setExpanded: (id: string | null) => void
  userSector?: string
  onChat: () => void
}

function TemplateCard({ template: t, expanded, setExpanded, userSector, onChat }: TemplateCardProps) {
  const isExpanded = expanded === t.id
  const isRelevant = userSector && t.sectors.includes(userSector)

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden transition-all',
      isRelevant ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-[#1A1A2E] border-white/8'
    )}>
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(isExpanded ? null : t.id)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md',
                t.category === 'Automação' ? 'bg-violet-500/15 text-violet-300' :
                t.category === 'Processos' ? 'bg-blue-500/15 text-blue-300' :
                'bg-amber-500/15 text-amber-300'
              )}>{t.category}</span>
              {isRelevant && (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md font-bold">
                  ★ Para você
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white leading-snug">{t.title}</p>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.problem}</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-indigo-300">
                <Clock size={9} /> {t.timeEstimate}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                <DollarSign size={9} /> {t.moneyEstimate}
              </span>
            </div>
          </div>
          <div className="shrink-0 mt-1">
            {isExpanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-3">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Solução</p>
            <p className="text-xs text-slate-300">{t.solution}</p>
          </div>

          <div>
            <p className="text-[10px] text-indigo-400 font-bold uppercase mb-2">Como implementar</p>
            <div className="space-y-1.5">
              {t.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3">
            <p className="text-[10px] text-violet-400 font-bold uppercase mb-1">Impacto esperado</p>
            <p className="text-xs text-slate-300">{t.impact}</p>
          </div>

          <button
            onClick={onChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs font-medium"
          >
            <MessageSquare size={12} /> Discutir com a IA como implementar
          </button>
        </div>
      )}
    </div>
  )
}

const sectorFilter: Record<string, string> = {
  restaurante: 'Restaurante',
  clinica: 'Clínica',
  loja_fisica: 'Loja Física',
  loja_online: 'Loja Online',
  escritorio: 'Escritório/Consultoria',
  bar: 'Bar',
  outro: 'Outros',
}

export function Biblioteca() {
  const { company } = useStore()
  const navigate = useNavigate()
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = templates.filter(t => {
    const matchCat = category === 'Todos' || t.category === category
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.problem.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const recommended = company?.sector
    ? filtered.filter(t => t.sectors.includes(company.sector))
    : []
  const others = filtered.filter(t => !recommended.includes(t))

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Biblioteca ProcessAI</h1>
        </div>
        <p className="text-xs text-slate-400">Processos prontos para implementar na sua empresa</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input-base pl-8 text-sm"
          placeholder="Buscar por problema ou solução..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
              category === cat
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-[#1E1E2E] text-slate-400 border border-white/6'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommended for sector */}
      {recommended.length > 0 && !search && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-indigo-400" />
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
              Recomendados para {sectorFilter[company?.sector ?? ''] ?? 'você'}
            </p>
          </div>
          {recommended.map(t => <TemplateCard key={t.id} template={t} expanded={expanded} setExpanded={setExpanded} userSector={company?.sector} onChat={() => navigate('/chat')} />)}
        </div>
      )}

      {/* Other templates */}
      {others.length > 0 && (
        <div className="space-y-2">
          {!search && recommended.length > 0 && (
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Outros segmentos</p>
          )}
          {others.map(t => <TemplateCard key={t.id} template={t} expanded={expanded} setExpanded={setExpanded} userSector={company?.sector} onChat={() => navigate('/chat')} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">Nenhum template encontrado para "{search}"</p>
        </div>
      )}
    </div>
  )
}
