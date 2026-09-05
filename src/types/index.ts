export type Sector =
  | 'restaurante'
  | 'loja_fisica'
  | 'loja_online'
  | 'escritorio'
  | 'clinica'
  | 'oficina'
  | 'bar'
  | 'outro'

export interface Company {
  id: string
  name: string
  sector: Sector
  owner_id: string
  created_at: string
  health_score: number
}

export interface User {
  id: string
  email: string
  name: string
  company_id: string | null
}

export interface OnboardingAnswer {
  question_id: string
  question: string
  answer: string
}

export interface Process {
  id: string
  company_id: string
  name: string
  description: string
  steps: ProcessStep[]
  problems: string[]
  status: 'ok' | 'atencao' | 'critico'
}

export interface ProcessStep {
  id: string
  name: string
  responsible: string
  duration_minutes: number
  is_bottleneck: boolean
}

export interface ImprovementTask {
  id: string
  company_id: string
  title: string
  description: string
  priority: 'alta' | 'media' | 'baixa'
  status: 'pendente' | 'em_andamento' | 'concluido'
  due_date: string
  methodology: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface DashboardMetric {
  label: string
  value: number
  unit?: string
  trend: 'up' | 'down' | 'stable'
  trend_value: number
}
