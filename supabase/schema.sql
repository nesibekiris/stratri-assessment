-- ═══════════════════════════════════════════════════════
-- STRATRI AI Assessments - Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL)
-- ═══════════════════════════════════════════════════════

-- Assessment sessions table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Type: 'maturity' or 'governance'
  type TEXT NOT NULL CHECK (type IN ('maturity', 'governance')),
  
  -- Status tracking
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  progress NUMERIC DEFAULT 0,  -- 0-100 percentage
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Organization profile
  organization_name TEXT,
  industry TEXT,
  employee_count TEXT,
  regions TEXT[] DEFAULT '{}',  -- governance only: ['eu', 'us', 'tr']
  
  -- Responses stored as JSONB for flexibility
  -- maturity:   { "strategy": { "0": 3, "1": 4 }, "data": { "0": 2 } }
  -- governance: { "policy": { "0": 3, "1": 2 }, "structure": { "0": 4 } }
  core_responses JSONB DEFAULT '{}',
  
  -- Regional compliance responses (governance only)
  -- { "eu": { "0": 15, "1": 0, "2": 7 }, "us": { "0": 12 } }
  regional_responses JSONB DEFAULT '{}',
  
  -- Calculated scores (saved on completion)
  -- { "strategy": 3.5, "data": 2.8, ... }
  domain_scores JSONB DEFAULT '{}',
  
  -- Regional compliance scores (governance only)
  -- { "eu": { "score": 42, "max": 65, "pct": 65 }, ... }
  regional_scores JSONB DEFAULT '{}',
  
  -- Overall maturity level (1-5)
  overall_score NUMERIC,
  maturity_level INTEGER,
  
  -- Contact info (for email delivery + lead gen)
  contact_name TEXT,
  contact_email TEXT,
  contact_company TEXT,
  contact_role TEXT,
  
  -- Consent
  email_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_assessments_type ON assessments(type);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_email ON assessments(contact_email);
CREATE INDEX idx_assessments_created ON assessments(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- Row Level Security
-- Public tool: anyone can create/read/update their own
-- Uses UUID as access token (no auth required)
-- ═══════════════════════════════════════════════════════

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Anyone can create a new assessment
CREATE POLICY "Anyone can insert" ON assessments
  FOR INSERT WITH CHECK (true);

-- Anyone with the UUID can read their assessment
CREATE POLICY "Anyone can read by id" ON assessments
  FOR SELECT USING (true);

-- Anyone with the UUID can update (auto-save)
CREATE POLICY "Anyone can update by id" ON assessments
  FOR UPDATE USING (true);

-- Only allow delete via service role (admin)
-- No public delete policy

-- ═══════════════════════════════════════════════════════
-- Email log table (optional, for tracking sends)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  recipient TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON email_log
  FOR ALL USING (false);
