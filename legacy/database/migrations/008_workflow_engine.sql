-- Migration 008: Workflow Engine - Deals and Enhanced Tasks
-- Creates deals table and refactors tasks to support context_type

-- ============================================================
-- DEALS TABLE
-- ============================================================
-- Deals represent the full transaction lifecycle
-- offer_rooms will remain for backward compatibility but deals is primary
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_post_id UUID NOT NULL REFERENCES listing_posts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  buyer_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Link to existing offer_room if one exists
  offer_room_id UUID REFERENCES offer_rooms(id) ON DELETE SET NULL,
  -- Deal stage with CHECK constraint
  stage TEXT NOT NULL DEFAULT 'active_search' CHECK (
    stage IN (
      'active_search',
      'touring',
      'offer_submitted',
      'offer_negotiation',
      'under_contract',
      'inspection',
      'appraisal',
      'title',
      'closing',
      'closed'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for deals
CREATE INDEX IF NOT EXISTS idx_deals_listing_post_id ON deals(listing_post_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller_id ON deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_agent_id ON deals(buyer_agent_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller_agent_id ON deals(seller_agent_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- REFACTOR TASKS TABLE
-- ============================================================
-- Add context_type and deal_id, make offer_room_id nullable
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS context_type TEXT CHECK (context_type IN ('listing', 'deal')),
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing tasks to set context_type based on existing columns
UPDATE tasks
SET context_type = CASE
  WHEN listing_post_id IS NOT NULL THEN 'listing'
  WHEN offer_room_id IS NOT NULL THEN 'deal'
  ELSE NULL
END
WHERE context_type IS NULL;

-- For tasks with offer_room_id, we'll need to create deals or migrate
-- For now, set context_type to 'deal' if offer_room_id exists
-- (We'll handle deal creation separately)

-- Add constraint: context_type must match non-null context
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_context_check;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_context_check CHECK (
    (context_type = 'listing' AND listing_post_id IS NOT NULL AND deal_id IS NULL) OR
    (context_type = 'deal' AND deal_id IS NOT NULL AND listing_post_id IS NULL)
  );

-- Rename 'role' to 'assigned_role' for clarity (if not already)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'assigned_role'
  ) THEN
    ALTER TABLE tasks RENAME COLUMN role TO assigned_role;
  END IF;
END $$;

-- Ensure assigned_role column exists
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS assigned_role TEXT;

-- Update status constraint to include 'in_progress'
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check CHECK (
    status IN ('pending', 'in_progress', 'blocked', 'completed', 'skipped')
  );

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_tasks_context_type ON tasks(context_type);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON tasks(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role ON tasks(assigned_role);

-- ============================================================
-- WORKFLOW TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key TEXT UNIQUE NOT NULL,  -- e.g. 'buyer.active_search.upload_preapproval'
  stage TEXT NOT NULL,
  assigned_role TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_in_days INT,
  dependency_titles TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for workflow_templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_stage ON workflow_templates(stage);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_role ON workflow_templates(assigned_role);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_key ON workflow_templates(template_key);

-- Trigger for updated_at
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

