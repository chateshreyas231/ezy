-- Migration 011: Add INSERT policy for users table
-- Allows users to create their own profile row on signup
-- This fixes the RLS error when upsertUser() tries to create a new user row

-- Users can insert their own profile row
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

