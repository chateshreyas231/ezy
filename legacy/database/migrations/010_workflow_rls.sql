-- Migration 010: Workflow Engine RLS Policies
-- Implements verified-only enforcement and role-based access

-- ============================================================
-- DEALS RLS POLICIES
-- ============================================================

-- Users can read deals they are part of
CREATE POLICY "Users can read own deals" ON deals
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR buyer_agent_id = auth.uid()
    OR seller_agent_id = auth.uid()
  );

-- Users can create deals (buyers creating deals, agents creating on behalf)
CREATE POLICY "Users can create deals" ON deals
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid()
    OR buyer_agent_id = auth.uid()
    OR seller_agent_id = auth.uid()
  );

-- Users can update deals they are part of
CREATE POLICY "Users can update own deals" ON deals
  FOR UPDATE USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR buyer_agent_id = auth.uid()
    OR seller_agent_id = auth.uid()
  );

-- ============================================================
-- LISTING POSTS - VERIFIED-ONLY ENFORCEMENT
-- ============================================================

-- Update existing policy to enforce verified-only for buyers
DROP POLICY IF EXISTS "Users can read verified listings in state" ON listing_posts;

CREATE POLICY "Buyers can only read verified listings" ON listing_posts
  FOR SELECT USING (
    -- Listing owner/agent can always see their own listings
    agent_id = auth.uid()
    OR (
      -- Others can only see verified listings in their state
      verified = TRUE
      AND listing_status = 'live'
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND state = listing_posts.state
        AND (
          -- Only verified buyers can see listings
          (role = 'buyer' AND verification_level >= 2)
          OR role != 'buyer'
        )
      )
    )
  );

-- ============================================================
-- CONVERSATIONS - VERIFIED BUYER ENFORCEMENT
-- ============================================================

-- Update conversation creation to require verification_level >= 2
DROP POLICY IF EXISTS "Verified buyer can create conversation" ON conversations;

CREATE POLICY "Verified buyers can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND (SELECT verification_level FROM users WHERE id = auth.uid()) >= 2
    AND EXISTS (
      -- Only allow conversations for verified listings
      SELECT 1 FROM listing_posts 
      WHERE id = conversations.listing_post_id 
      AND verified = TRUE
    )
  );

-- Sellers/agents can only see conversations with verified buyers
DROP POLICY IF EXISTS "Agent can read own listing conversations" ON conversations;

CREATE POLICY "Agents see verified buyer conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = buyer_id
    OR (
      EXISTS (
        SELECT 1 FROM listing_posts 
        WHERE id = conversations.listing_post_id 
        AND agent_id = auth.uid()
      )
      AND EXISTS (
        -- Only show conversations with verified buyers
        SELECT 1 FROM users 
        WHERE id = conversations.buyer_id 
        AND verification_level >= 2
      )
    )
  );

-- ============================================================
-- TASKS RLS - ROLE-BASED ACCESS
-- ============================================================

-- Drop existing task policies
DROP POLICY IF EXISTS "Read own role tasks" ON tasks;
DROP POLICY IF EXISTS "Insert tasks for own contexts" ON tasks;
DROP POLICY IF EXISTS "Update own role tasks" ON tasks;

-- Users can read tasks assigned to their role in contexts they're part of
CREATE POLICY "Read tasks by role and context" ON tasks
  FOR SELECT USING (
    -- Task must be assigned to user's role
    assigned_role = (SELECT role FROM users WHERE id = auth.uid())
    AND (
      -- If listing context, user must be listing owner/agent
      (context_type = 'listing' AND listing_post_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM listing_posts 
          WHERE id = tasks.listing_post_id 
          AND agent_id = auth.uid()
        )
      )
      OR
      -- If deal context, user must be part of the deal
      (context_type = 'deal' AND deal_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM deals 
          WHERE id = tasks.deal_id
          AND (
            buyer_id = auth.uid()
            OR seller_id = auth.uid()
            OR buyer_agent_id = auth.uid()
            OR seller_agent_id = auth.uid()
          )
        )
      )
      OR
      -- Legacy: support offer_room_id for backward compatibility
      (offer_room_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM offer_rooms 
          JOIN matches ON offer_rooms.match_id = matches.id
          WHERE offer_rooms.id = tasks.offer_room_id
          AND (
            EXISTS (
              SELECT 1 FROM buyer_need_posts 
              WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM listing_posts 
              WHERE id = matches.listing_post_id AND agent_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- Users can insert tasks for contexts they're part of
CREATE POLICY "Insert tasks for own contexts" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      (context_type = 'listing' AND listing_post_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM listing_posts 
          WHERE id = tasks.listing_post_id 
          AND agent_id = auth.uid()
        )
      )
      OR
      (context_type = 'deal' AND deal_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM deals 
          WHERE id = tasks.deal_id
          AND (
            buyer_id = auth.uid()
            OR seller_id = auth.uid()
            OR buyer_agent_id = auth.uid()
            OR seller_agent_id = auth.uid()
          )
        )
      )
      OR
      (offer_room_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM offer_rooms 
          JOIN matches ON offer_rooms.match_id = matches.id
          WHERE offer_rooms.id = tasks.offer_room_id
          AND (
            EXISTS (
              SELECT 1 FROM buyer_need_posts 
              WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM listing_posts 
              WHERE id = matches.listing_post_id AND agent_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- Users can update tasks assigned to their role
CREATE POLICY "Update tasks by role and context" ON tasks
  FOR UPDATE USING (
    assigned_role = (SELECT role FROM users WHERE id = auth.uid())
    AND (
      (context_type = 'listing' AND listing_post_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM listing_posts 
          WHERE id = tasks.listing_post_id 
          AND agent_id = auth.uid()
        )
      )
      OR
      (context_type = 'deal' AND deal_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM deals 
          WHERE id = tasks.deal_id
          AND (
            buyer_id = auth.uid()
            OR seller_id = auth.uid()
            OR buyer_agent_id = auth.uid()
            OR seller_agent_id = auth.uid()
          )
        )
      )
      OR
      (offer_room_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM offer_rooms 
          JOIN matches ON offer_rooms.match_id = matches.id
          WHERE offer_rooms.id = tasks.offer_room_id
          AND (
            EXISTS (
              SELECT 1 FROM buyer_need_posts 
              WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM listing_posts 
              WHERE id = matches.listing_post_id AND agent_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- ============================================================
-- WORKFLOW TEMPLATES RLS
-- ============================================================

-- Workflow templates are read-only for all authenticated users
CREATE POLICY "Authenticated users can read workflow templates" ON workflow_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can insert/update templates (via Edge Functions or admin)
-- No INSERT/UPDATE policies for regular users

