#!/usr/bin/env ts-node
/**
 * Fix RLS Policies for Matches
 * 
 * Applies INSERT policies to matches, deal_rooms, and deal_participants tables
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔧 Fixing RLS Policies\n');
  
  const policies = [
    {
      name: 'matches INSERT',
      sql: `CREATE POLICY "Authenticated users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);`
    },
    {
      name: 'deal_rooms INSERT',
      sql: `CREATE POLICY "Users can create deal rooms for their matches" ON deal_rooms FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM matches WHERE matches.id = match_id AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())));`
    },
    {
      name: 'deal_participants INSERT',
      sql: `CREATE POLICY "Users can add participants to deal rooms they're in" ON deal_participants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM deal_rooms JOIN matches ON matches.id = deal_rooms.match_id WHERE deal_rooms.id = deal_room_id AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())));`
    },
  ];

  console.log('📋 SQL to run in Supabase Dashboard → SQL Editor:\n');
  console.log('---\n');
  
  policies.forEach(policy => {
    console.log(`-- ${policy.name}`);
    console.log(`DROP POLICY IF EXISTS "${policy.name.split(' ')[0]}" ON ${policy.name.split(' ')[0]};`);
    console.log(policy.sql);
    console.log('');
  });
  
  console.log('---\n');
  console.log('⚠️  Copy the SQL above and run it in your Supabase Dashboard');
  console.log('   Dashboard → SQL Editor → Paste → Run\n');
}

main();
