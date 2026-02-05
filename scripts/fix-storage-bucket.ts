/**
 * Script to delete and recreate the listing-media bucket without MIME restrictions
 * Run this if uploads are failing due to MIME type restrictions
 * 
 * Usage:
 * npx ts-node scripts/fix-storage-bucket.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixBucket() {
  console.log('🔧 Fixing listing-media bucket...\n');

  const bucketName = 'listing-media';

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);

  if (bucketExists) {
    console.log('⚠️  Bucket exists. Deleting to recreate without MIME restrictions...');
    
    // Delete all files first (required before deleting bucket)
    const { data: files } = await supabase.storage.from(bucketName).list();
    if (files && files.length > 0) {
      console.log(`   Found ${files.length} files, deleting...`);
      const filePaths = files.map(f => f.name);
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filePaths);
      
      if (deleteError) {
        console.error('   ⚠️  Error deleting files:', deleteError.message);
        console.log('   → You may need to delete files manually in the dashboard');
      } else {
        console.log('   ✓ Files deleted');
      }
    }

    // Delete bucket
    const { error: deleteBucketError } = await supabase.storage.deleteBucket(bucketName);
    if (deleteBucketError) {
      console.error('❌ Failed to delete bucket:', deleteBucketError.message);
      console.log('\n💡 Try deleting it manually in Supabase Dashboard > Storage');
      return;
    }
    console.log('   ✓ Bucket deleted\n');
  }

  // Create new bucket without MIME restrictions
  console.log('Creating new bucket without MIME type restrictions...');
  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    // No allowedMimeTypes restriction - allows all types
  });

  if (createError) {
    console.error('❌ Failed to create bucket:', createError.message);
    return;
  }

  console.log('✅ Bucket recreated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npx ts-node scripts/upload-assets-to-storage.ts');
  console.log('   2. Assets will upload without MIME type errors');
}

fixBucket().catch(console.error);

