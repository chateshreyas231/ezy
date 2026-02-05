-- Migration 004: User Verification and Verified Listings
-- Adds verification_level to users and verified flags to listings

-- Add verification_level to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_level INT NOT NULL DEFAULT 0;

-- Add verified flags to listing_posts
ALTER TABLE listing_posts
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS listing_status TEXT DEFAULT 'active';

-- Add explanation field to matches for AI-generated match explanations
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Add push_token to users for notifications
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS push_token TEXT;

