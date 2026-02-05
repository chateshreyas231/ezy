-- Migration 012: Add verification and documents support
-- Adds buyer_verified, seller_verified columns to profiles
-- Adds readiness_score and verified columns to buyer_intents
-- Creates documents table for deal room document management

-- ============================================
-- ADD VERIFICATION COLUMNS TO PROFILES
-- ============================================

-- Add buyer_verified column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS buyer_verified BOOLEAN NOT NULL DEFAULT false;

-- Add seller_verified column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS seller_verified BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- ADD VERIFICATION COLUMNS TO BUYER_INTENTS
-- ============================================

-- Add verified column to buyer_intents
ALTER TABLE buyer_intents
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- Add readiness_score column to buyer_intents
ALTER TABLE buyer_intents
  ADD COLUMN IF NOT EXISTS readiness_score INTEGER DEFAULT 0;

-- ============================================
-- CREATE DOCUMENTS TABLE
-- ============================================

-- Create documents table for deal room document management
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on deal_room_id for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_deal_room_id ON documents(deal_room_id);

-- Create index on uploader_id for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_uploader_id ON documents(uploader_id);
