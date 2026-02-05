-- Migration 030: Add task collaboration features
-- Adds task comments, attachments, mentions, categories, and ordering

-- ============================================
-- STEP 1: Add columns to tasks table
-- ============================================

-- Add category for grouping tasks by phase
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('pre_offer', 'due_diligence', 'financing', 'closing', 'general')) DEFAULT 'general';

-- Add order_index for sorting within categories
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Add updated_at for tracking changes
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- STEP 2: Create task_comments table
-- ============================================

CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author ON task_comments(author_profile_id);

-- ============================================
-- STEP 3: Create task_attachments table
-- ============================================

CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploader ON task_attachments(uploader_id);

-- ============================================
-- STEP 4: Create task_mentions table
-- ============================================

CREATE TABLE IF NOT EXISTS task_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_comment_id UUID NOT NULL REFERENCES task_comments(id) ON DELETE CASCADE,
  mentioned_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_comment_id, mentioned_profile_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_mentions_comment_id ON task_mentions(task_comment_id);
CREATE INDEX IF NOT EXISTS idx_task_mentions_profile_id ON task_mentions(mentioned_profile_id);

-- ============================================
-- STEP 5: Add RLS policies for task_comments
-- ============================================

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on tasks in their deal rooms
CREATE POLICY "Users can view task comments in their deal rooms"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN deal_rooms dr ON dr.id = t.deal_room_id
      WHERE t.id = task_comments.task_id
      AND is_user_in_match(dr.match_id, auth.uid())
    )
  );

-- Users can create comments on tasks in their deal rooms
CREATE POLICY "Users can create task comments in their deal rooms"
  ON task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_profile_id
    AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN deal_rooms dr ON dr.id = t.deal_room_id
      WHERE t.id = task_id
      AND is_user_in_match(dr.match_id, auth.uid())
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own task comments"
  ON task_comments FOR UPDATE
  USING (auth.uid() = author_profile_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own task comments"
  ON task_comments FOR DELETE
  USING (auth.uid() = author_profile_id);

-- ============================================
-- STEP 6: Add RLS policies for task_attachments
-- ============================================

ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments on tasks in their deal rooms
CREATE POLICY "Users can view task attachments in their deal rooms"
  ON task_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN deal_rooms dr ON dr.id = t.deal_room_id
      WHERE t.id = task_attachments.task_id
      AND is_user_in_match(dr.match_id, auth.uid())
    )
  );

-- Users can upload attachments to tasks in their deal rooms
CREATE POLICY "Users can upload task attachments in their deal rooms"
  ON task_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = uploader_id
    AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN deal_rooms dr ON dr.id = t.deal_room_id
      WHERE t.id = task_id
      AND is_user_in_match(dr.match_id, auth.uid())
    )
  );

-- Users can delete their own attachments
CREATE POLICY "Users can delete own task attachments"
  ON task_attachments FOR DELETE
  USING (auth.uid() = uploader_id);

-- ============================================
-- STEP 7: Add RLS policies for task_mentions
-- ============================================

ALTER TABLE task_mentions ENABLE ROW LEVEL SECURITY;

-- Users can view mentions in their deal rooms
CREATE POLICY "Users can view task mentions in their deal rooms"
  ON task_mentions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_comments tc
      JOIN tasks t ON t.id = tc.task_id
      JOIN deal_rooms dr ON dr.id = t.deal_room_id
      WHERE tc.id = task_mentions.task_comment_id
      AND is_user_in_match(dr.match_id, auth.uid())
    )
  );

-- Users can create mentions when commenting
CREATE POLICY "Users can create task mentions in their deal rooms"
  ON task_mentions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_comments tc
      JOIN tasks t ON t.id = tc.task_id
      JOIN deal_rooms dr ON dr.id = t.deal_room_id
      WHERE tc.id = task_comment_id
      AND is_user_in_match(dr.match_id, auth.uid())
    )
  );
