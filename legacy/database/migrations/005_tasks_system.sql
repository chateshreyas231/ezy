-- Migration 005: Tasks and Workflow Engine
-- Creates tasks table for role-based task management

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_post_id UUID REFERENCES listing_posts(id) ON DELETE CASCADE,
  offer_room_id UUID REFERENCES offer_rooms(id) ON DELETE CASCADE,
  role TEXT NOT NULL,           -- Role responsible (e.g. 'buyer', 'seller', 'agent', 'lawyer', etc.)
  title TEXT NOT NULL,          -- Task description/title
  due_at TIMESTAMPTZ,           -- Optional due date/time
  status TEXT NOT NULL DEFAULT 'pending',  -- e.g. 'pending', 'completed', 'blocked', 'skipped'
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  dependencies UUID[] DEFAULT ARRAY[]::UUID[], -- prerequisite tasks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure at least one context is set
  CHECK (
    (listing_post_id IS NOT NULL AND offer_room_id IS NULL) OR
    (listing_post_id IS NULL AND offer_room_id IS NOT NULL)
  )
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_role ON tasks(role);
CREATE INDEX IF NOT EXISTS idx_tasks_listing ON tasks(listing_post_id) WHERE listing_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_offer_room ON tasks(offer_room_id) WHERE offer_room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at) WHERE due_at IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

