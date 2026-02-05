/**
 * Quick script to reset password for test users via Supabase Admin API
 * Usage: npx tsx scripts/reset-password.ts [email]
 * 
 * REQUIRES: SUPABASE_SERVICE_ROLE_KEY in .env file
 * Get it from: Supabase Dashboard > Settings > API > service_role key
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL');
  console.error('   Please set it in your .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('   This is REQUIRED for password resets.');
  console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key');
  console.error('   Add it to your .env file as: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_PASSWORD = 'test123456';

async function resetPassword(email: string) {
  try {
    console.log(`\n🔍 Looking for user: ${email}...`);
    
    // Find user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      if (listError.message.includes('JWT')) {
        console.error('   This usually means you need SUPABASE_SERVICE_ROLE_KEY (not anon key)');
      }
      return false;
    }

    const user = users?.users.find(u => u.email === email);
    if (!user) {
      console.error(`❌ User ${email} not found`);
      console.log(`\n   Available users:`);
      users?.users.slice(0, 10).forEach(u => {
        console.log(`   - ${u.email} (${u.id})`);
      });
      return false;
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`);
    console.log(`\n🔐 Resetting password...`);

    // Reset password
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: TEST_PASSWORD }
    );

    if (updateError) {
      console.error(`❌ Failed to reset password:`, updateError.message);
      if (updateError.message.includes('JWT') || updateError.message.includes('permission')) {
        console.error('   Make sure you\'re using SUPABASE_SERVICE_ROLE_KEY (not anon key)');
      }
      return false;
    }

    console.log(`\n✅ SUCCESS! Password reset for ${email}`);
    console.log(`   New password: ${TEST_PASSWORD}`);
    console.log(`\n   You can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${TEST_PASSWORD}\n`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  const email = process.argv[2] || 'seller1@ezriya.test';
  console.log('='.repeat(60));
  console.log('🔑 Supabase Password Reset Tool');
  console.log('='.repeat(60));
  
  const success = await resetPassword(email);
  
  if (!success) {
    console.log('\n💡 Alternative: Reset password via Supabase Dashboard:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to: Authentication > Users');
    console.log(`   4. Find user: ${email}`);
    console.log('   5. Click "..." menu > "Reset Password"');
    console.log('   6. Or click "Edit" and set password manually\n');
    process.exit(1);
  }
}

main().catch(console.error);
