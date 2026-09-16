-- Tabela de memórias classificadas da IA por empresa
CREATE TABLE IF NOT EXISTS ai_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('fato','hipotese','oportunidade','problema','solucao')),
  category text NOT NULL DEFAULT 'geral',
  fact text NOT NULL,
  source text DEFAULT 'chat',
  confidence text DEFAULT 'media' CHECK (confidence IN ('alta','media','baixa')),
  time_estimate text,
  financial_impact text,
  status text DEFAULT 'ativo' CHECK (status IN ('ativo','resolvido','descartado')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company members can manage memories"
  ON ai_memories FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Índice para buscas por empresa e tipo
CREATE INDEX IF NOT EXISTS ai_memories_company_type_idx ON ai_memories(company_id, type);
CREATE INDEX IF NOT EXISTS ai_memories_company_created_idx ON ai_memories(company_id, created_at DESC);
