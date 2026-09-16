export interface AreaQuestions {
  area: string
  questions: string[]
}

export const questionBankByArea: AreaQuestions[] = [
  {
    area: 'Vendas',
    questions: [
      'Qual é o principal canal de vendas (presencial, WhatsApp, redes sociais, site)?',
      'Como as oportunidades de venda são registradas? Usa algum sistema ou é tudo na cabeça/caderno?',
      'Existe um funil de vendas definido? Quais são as etapas (orçamento → proposta → fechamento)?',
      'Quem faz as vendas? Só o dono ou tem equipe comercial?',
      'Há metas de vendas definidas? Como são acompanhadas?',
      'Como funciona o sistema de comissões (se houver)?',
      'Qual é o ticket médio por venda? E a taxa de conversão estimada?',
      'O que mais costuma fazer o cliente desistir da compra?',
      'Existe acompanhamento pós-venda? Como funciona?',
      'Com que frequência um cliente que comprou volta a comprar?',
    ],
  },
  {
    area: 'Comercial',
    questions: [
      'Como a empresa prospecta novos clientes hoje?',
      'Existe script ou padrão de abordagem comercial?',
      'Como os orçamentos são elaborados e enviados?',
      'Quanto tempo leva em média do primeiro contato até o fechamento?',
      'Quais são os principais concorrentes e como a empresa se diferencia?',
    ],
  },
  {
    area: 'Estoque',
    questions: [
      'Como o estoque é controlado hoje — sistema, planilha ou manualmente?',
      'Quem é responsável por atualizar o estoque e com que frequência?',
      'Existem quantidades mínimas e máximas definidas para os produtos?',
      'Com que frequência ocorre inventário físico?',
      'Já aconteceu de vender um produto que não tinha em estoque? Com que frequência?',
      'Como são registradas as entradas e saídas de mercadoria?',
      'Existe rastreamento de validade dos produtos?',
      'Como é definido o critério para fazer uma nova compra?',
      'Há histórico de consumo para prever a demanda?',
      'Quanto tempo por semana é gasto em atividades de controle de estoque?',
    ],
  },
  {
    area: 'Compras',
    questions: [
      'Quem solicita, quem aprova e quem efetivamente faz as compras?',
      'Qual é o critério para escolher um fornecedor?',
      'Os fornecedores estão cadastrados em algum lugar?',
      'É feita comparação de preços entre fornecedores antes de comprar?',
      'Existe histórico de pedidos de compra?',
      'Como funciona o processo de aprovação de uma compra?',
      'Com que frequência acontecem compras emergenciais? Qual o motivo?',
      'Como é feita a conferência da mercadoria que chega?',
    ],
  },
  {
    area: 'Financeiro',
    questions: [
      'Como são controladas as receitas e despesas — sistema, planilha ou papel?',
      'Existe fluxo de caixa atualizado? Com que frequência é revisado?',
      'A empresa tem um DRE (Demonstrativo de Resultado) mensal?',
      'Sabe exatamente qual é o custo fixo mensal da empresa?',
      'Conhece a margem de lucro de cada produto ou serviço?',
      'Como funciona a conciliação bancária?',
      'Existe controle de contas a pagar e a receber?',
      'Com que frequência clientes atrasam pagamentos?',
      'Existe algum processo de cobrança automática para inadimplentes?',
      'O faturamento atual cobre todos os custos e ainda gera lucro?',
    ],
  },
  {
    area: 'Atendimento',
    questions: [
      'Quantos atendimentos são realizados por dia (estimativa)?',
      'Qual é o tempo médio de resposta para um cliente que entra em contato?',
      'Existe um padrão de atendimento documentado?',
      'Como os clientes avaliam o atendimento atual?',
      'Qual é o principal motivo de reclamações dos clientes?',
      'Existe histórico de atendimentos registrado?',
    ],
  },
  {
    area: 'WhatsApp / Mensagens',
    questions: [
      'Quantas mensagens a empresa recebe por dia no WhatsApp (estimativa)?',
      'Quantas pessoas respondem o WhatsApp?',
      'A empresa usa um número só ou vários números?',
      'Existe histórico das conversas salvo em algum lugar?',
      'Como os orçamentos são enviados pelo WhatsApp?',
      'Há follow-up com clientes que pediram orçamento mas não fecharam?',
      'Qual é o tempo médio de resposta às mensagens?',
      'Já perdeu clientes por demora no atendimento pelo WhatsApp?',
      'Usa mensagens prontas/padrão para alguma situação?',
      'Faz pós-venda pelo WhatsApp? Como funciona?',
    ],
  },
  {
    area: 'Marketing',
    questions: [
      'Quais canais de marketing são usados atualmente (Instagram, Google, panfleto, indicação)?',
      'Quanto é investido em marketing por mês?',
      'Como é medido o resultado das ações de marketing?',
      'Existe alguém responsável pelo marketing ou é feito pelo dono?',
      'Com que frequência são publicados conteúdos nas redes sociais?',
      'Como os clientes geralmente descobrem a empresa?',
    ],
  },
  {
    area: 'Clientes / CRM',
    questions: [
      'Existe uma base de clientes cadastrada? Quantos clientes ativos?',
      'Quais informações são guardadas sobre cada cliente?',
      'Como é feito o acompanhamento do histórico de compras por cliente?',
      'Existe alguma estratégia de fidelização?',
      'Com que frequência um cliente ativo é contatado proativamente?',
    ],
  },
  {
    area: 'Operação',
    questions: [
      'Quais são as etapas do processo principal de entrega do produto/serviço?',
      'Qual etapa costuma ser o maior gargalo na operação?',
      'Quanto tempo leva o processo completo do pedido até a entrega?',
      'Existe alguma etapa que depende exclusivamente de uma pessoa específica?',
      'Quais erros operacionais são mais frequentes?',
    ],
  },
  {
    area: 'Produção',
    questions: [
      'Qual é a capacidade de produção atual versus a capacidade máxima?',
      'Como é feito o controle de qualidade da produção?',
      'Existe ficha técnica ou receituário para cada produto?',
      'Como é planejada a produção diária/semanal?',
      'Quais insumos são mais críticos (risco de falta)?',
    ],
  },
  {
    area: 'Logística',
    questions: [
      'Como funciona o processo de entrega (própria, terceirizada, cliente retira)?',
      'Qual é o prazo médio de entrega prometido versus o real?',
      'Como os pedidos de entrega são organizados e priorizados?',
      'Existe rastreamento das entregas?',
      'Qual é o custo médio de entrega por pedido?',
    ],
  },
  {
    area: 'Recursos Humanos',
    questions: [
      'Existe organograma ou descrição de cargos e funções?',
      'Como novos funcionários são treinados?',
      'Existe manual de procedimentos documentado?',
      'Como é avaliado o desempenho da equipe?',
      'Quais tarefas dependem diretamente de uma única pessoa?',
      'Com que frequência ocorrem erros por falta de treinamento?',
      'Como é feita a integração de um funcionário novo?',
      'A empresa teria problemas sérios se um funcionário-chave saísse?',
    ],
  },
  {
    area: 'Gestão',
    questions: [
      'O dono consegue tirar férias sem a empresa parar?',
      'Existem reuniões de equipe regulares? Com que frequência?',
      'Como as decisões estratégicas são tomadas?',
      'Existe planejamento para os próximos 3 a 6 meses?',
      'Quais indicadores o dono acompanha regularmente?',
    ],
  },
  {
    area: 'Projetos',
    questions: [
      'Como os projetos são organizados e acompanhados?',
      'Existe prazo e responsável definido para cada projeto?',
      'Quantos projetos simultâneos a empresa costuma tocar?',
      'Como os clientes acompanham o andamento do projeto?',
    ],
  },
  {
    area: 'Pós-venda',
    questions: [
      'Existe um processo formal de pós-venda?',
      'Após quanto tempo do fechamento o cliente é contatado?',
      'Como são coletadas avaliações e feedbacks dos clientes?',
      'As reclamações recebidas geram alguma mudança de processo?',
    ],
  },
  {
    area: 'Qualidade',
    questions: [
      'Como é feito o controle de qualidade dos produtos/serviços entregues?',
      'Qual é a taxa de devolução ou retrabalho?',
      'Existe checklist de qualidade antes da entrega?',
      'Como os erros e não-conformidades são registrados?',
    ],
  },
  {
    area: 'Manutenção',
    questions: [
      'Existe plano de manutenção preventiva de equipamentos?',
      'Com que frequência equipamentos param por falha não planejada?',
      'Qual o impacto na operação quando um equipamento para?',
      'Como são registrados os históricos de manutenção?',
    ],
  },
  {
    area: 'Administração',
    questions: [
      'Quais tarefas administrativas tomam mais tempo por semana?',
      'Existe alguma tarefa repetitiva que poderia ser automatizada?',
      'Como são feitos os relatórios gerenciais?',
      'Quanto tempo por semana é gasto em burocracia e papelada?',
    ],
  },
]

export const mandatoryOwnerQuestions = [
  'Quais tarefas dependem DIRETAMENTE de você para acontecer?',
  'Se você ficasse 30 dias fora da empresa, o que deixaria de funcionar?',
  'Quais decisões só você consegue tomar? Existe alguém que poderia substituí-lo?',
  'Quais informações a equipe sempre vem te pedir?',
  'O que você repete para os funcionários quase todos os dias?',
]

export function getQuestionsForAreas(selectedAreaNames: string[]): AreaQuestions[] {
  return questionBankByArea.filter(aq =>
    selectedAreaNames.some(name =>
      aq.area.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(aq.area.toLowerCase())
    )
  )
}
