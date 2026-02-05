#!/usr/bin/env ts-node
/**
 * Apply Matches INSERT Policy
 * 
 * This script applies the RLS policy to allow users to create matches
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.error('Need: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or EXPO_PUBLIC_SUPABASE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔧 Applying Matches INSERT Policy\n');

  const sql = `
-- Add INSERT policy for matches table
DROP POLICY IF EXISTS "System can create matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON matches;

CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Add INSERT policy for deal_rooms
DROP POLICY IF EXISTS "Users can create deal rooms" ON deal_rooms;
DROP POLICY IF EXISTS "Users can create deal rooms for their matches" ON deal_rooms;

CREATE POLICY "Users can create deal rooms for their matches"
  ON deal_rooms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())
    )
  );

-- Add INSERT policy for deal_participants
DROP POLICY IF EXISTS "Users can add participants to their deal rooms" ON deal_participants;
DROP POLICY IF EXISTS "Users can add participants to deal rooms they're in" ON deal_participants;

CREATE POLICY "Users can add participants to deal rooms they're in"
  ON deal_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_rooms
      JOIN matches ON matches.id = deal_rooms.match_id
      WHERE deal_rooms.id = deal_room_id
        AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())
    )
  );

-- Add INSERT policy for conversations
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;

CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_rooms
      JOIN matches ON matches.id = deal_rooms.match_id
      WHERE deal_rooms.id = deal_room_id
        AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())
    )
  );
`;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Failed to apply policy:', error);
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n');
      console.log(sql);
      return;
    }

    console.log('✅ Policies applied successfully!');
  } catch (error: any) {
    console.log('\n⚠️  RPC function not available. Please apply this SQL manually in Supabase SQL Editor:\n');
    console.log('---');
    console.log(sql);
    console.log('---');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
