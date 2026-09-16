-- Fix solutions table RLS to allow company owners to insert
-- Run this in Supabase Dashboard > SQL Editor

-- Create solutions table if it doesn't exist
CREATE TABLE IF NOT EXISTS solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text DEFAULT 'other' CHECK (type IN ('automacao','planilha','documento','template','video','checklist','other')),
  access_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Allow company owners to see their solutions
DROP POLICY IF EXISTS "company members can read solutions" ON solutions;
CREATE POLICY "company members can read solutions"
  ON solutions FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Allow company owners to insert solutions (for admin who owns all test companies)
DROP POLICY IF EXISTS "company owners can insert solutions" ON solutions;
CREATE POLICY "company owners can insert solutions"
  ON solutions FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Allow company owners to update solutions
DROP POLICY IF EXISTS "company owners can update solutions" ON solutions;
CREATE POLICY "company owners can update solutions"
  ON solutions FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Ensure client_context table exists with correct schema
CREATE TABLE IF NOT EXISTS client_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  source text DEFAULT 'chat',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company members can manage context" ON client_context;
CREATE POLICY "company members can manage context"
  ON client_context FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
