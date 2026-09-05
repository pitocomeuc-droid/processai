-- Tabela de empresas
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  health_score integer default 50,
  created_at timestamptz default now()
);

-- Tabela de respostas do onboarding
create table if not exists onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  question_id text not null,
  question text not null,
  answer text not null,
  created_at timestamptz default now()
);

-- Tabela de processos
create table if not exists processes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  description text,
  steps jsonb default '[]',
  problems jsonb default '[]',
  status text default 'ok' check (status in ('ok','atencao','critico')),
  methodology text,
  created_at timestamptz default now()
);

-- Tabela de melhorias
create table if not exists improvement_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'media' check (priority in ('alta','media','baixa')),
  status text default 'pendente' check (status in ('pendente','em_andamento','concluido')),
  due_date date,
  methodology text,
  impact text,
  created_at timestamptz default now()
);

-- Tabela de conversas com IA
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- RLS: Row Level Security
alter table companies enable row level security;
alter table onboarding_answers enable row level security;
alter table processes enable row level security;
alter table improvement_tasks enable row level security;
alter table ai_conversations enable row level security;

-- Policies: usuario so ve dados da propria empresa
create policy "owner can manage company"
  on companies for all using (owner_id = auth.uid());

create policy "company members can read answers"
  on onboarding_answers for all
  using (company_id in (select id from companies where owner_id = auth.uid()));

create policy "company members can manage processes"
  on processes for all
  using (company_id in (select id from companies where owner_id = auth.uid()));

create policy "company members can manage tasks"
  on improvement_tasks for all
  using (company_id in (select id from companies where owner_id = auth.uid()));

create policy "company members can manage conversations"
  on ai_conversations for all
  using (company_id in (select id from companies where owner_id = auth.uid()));
