-- Unified Architecture Schema Migration
-- Run this to upgrade existing schema to support AI features and Unified Architecture

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Enhance Properties Table for AI & Logistics
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_listings_coords ON listings USING GIST(coordinates);

-- 3. AI Property Analysis Results
CREATE TABLE IF NOT EXISTS property_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL, -- 'condition', 'floor_plan', 'privacy', 'sunlight'
    results JSONB NOT NULL,
    confidence NUMERIC(3, 2),
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deal AI Tasks
CREATE TABLE IF NOT EXISTS deal_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES profiles(id),
    due_date DATE,
    status TEXT DEFAULT 'pending', 
    priority TEXT DEFAULT 'medium',
    dependencies UUID[],
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 5. AI Conversations (Separate from Deal Messages)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    messages JSONB NOT NULL DEFAULT '[]',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Intent Matches (Enhanced)
CREATE TABLE IF NOT EXISTS intent_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_id UUID REFERENCES buyer_intents(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    match_score NUMERIC(3, 2),
    match_reasons JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(intent_id, listing_id)
);
